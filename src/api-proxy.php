<?php
/**
 * Same-origin reverse proxy for cPanel/Apache.
 *
 * The site is served over https but both upstreams are http-only, so the
 * browser would refuse the requests as mixed content. Everything is routed
 * through this script instead, which talks http server-side where mixed
 * content rules do not apply.
 *
 *   /api/...    -> the catalogue API
 *   /media/...  -> MinIO object storage (presigned image URLs)
 *
 * Upstreams are hardcoded on purpose: this must never become an open proxy.
 *
 * Used via .htaccess:
 *   RewriteRule ^api/   api-proxy.php [L,QSA]
 *   RewriteRule ^media/ api-proxy.php [L,QSA]
 */

const BACKEND = 'http://41.59.225.78:8018';   // catalogue API

// Object-storage hosts the API may hand back presigned URLs for. This is an
// allowlist, not a config list: /media/<host>/... only proxies to a host named
// here, so the script can never be turned into an open proxy. Add a host here
// if the backend starts serving images from it.
// Object-storage upstreams, addressed by an opaque key so the public URL never
// exposes the storage host or port. Browsers only ever see /media/s1/<object>.
// This is also an allowlist: /media/<key>/ resolves only to a host named here,
// so the script can never be turned into an open proxy.
//
// s1 is where the objects actually live; s2 is the alternate address.
const MEDIA_HOSTS = [
    's1' => '41.59.228.129:9000',
    's2' => '41.59.225.78:9000',
];

if (!function_exists('curl_init')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'PHP curl extension is not enabled on this host']);
    exit;
}

// Not defined when PHP runs as CGI/FastCGI rather than an Apache module.
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $out = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $out[$name] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE']))   $out['Content-Type']   = $_SERVER['CONTENT_TYPE'];
        if (isset($_SERVER['CONTENT_LENGTH'])) $out['Content-Length'] = $_SERVER['CONTENT_LENGTH'];
        return $out;
    }
}

// The pre-rewrite URI still carries the original /api or /media path.
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
// Split by hand: parse_url() returns false on paths containing "host:port".
$qpos  = strpos($requestUri, '?');
$path  = $qpos === false ? $requestUri : substr($requestUri, 0, $qpos);
$query = $qpos === false ? null : substr($requestUri, $qpos + 1);
if ($path === '') {
    $path = '/';
}

if (strpos($path, '/api/') === 0 || $path === '/api') {
    $target = BACKEND . $path;
    // Only API responses carry absolute upstream URLs that need rewriting.
    $rewriteBody = true;
} elseif (strpos($path, '/media/') === 0) {
    // Shape is /media/<key>/<object-path> - no storage host in the URL.
    $rest  = substr($path, strlen('/media/'));
    $slash = strpos($rest, '/');
    $slug  = $slash === false ? $rest : substr($rest, 0, $slash);

    if (!isset(MEDIA_HOSTS[$slug])) {
        // Fail loudly rather than guessing a host - guessing produces a
        // confusing SignatureDoesNotMatch from the object store instead.
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unknown media key']);
        exit;
    }

    $target = 'http://' . MEDIA_HOSTS[$slug] . ($slash === false ? '' : substr($rest, $slash));
    $rewriteBody = false;
} else {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not found']);
    exit;
}

// The presigned MinIO signature covers the Host header, so the query string
// must be forwarded byte-for-byte and Host left as the upstream's own.
if ($query !== null && $query !== '') {
    $target .= '?' . $query;
}

$forwardHeaders = [];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    // Hop-by-hop / host-specific headers must not be forwarded. Dropping
    // Accept-Encoding keeps responses uncompressed so the body rewrite below
    // operates on plain text.
    if (in_array($lower, ['host', 'connection', 'content-length', 'accept-encoding'], true)) {
        continue;
    }
    $forwardHeaders[] = $name . ': ' . $value;
}
if (empty($_SERVER['HTTP_AUTHORIZATION']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $forwardHeaders[] = 'Authorization: ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}
$forwardHeaders[] = 'X-Forwarded-Proto: https';
$forwardHeaders[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? '');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body   = in_array($method, ['GET', 'HEAD'], true) ? null : file_get_contents('php://input');

$SKIP_RESPONSE_HEADERS = ['transfer-encoding', 'connection', 'content-encoding'];

// Hide headers that would identify the storage backend to the browser.
$hideHeader = function ($lower) use ($SKIP_RESPONSE_HEADERS) {
    return in_array($lower, $SKIP_RESPONSE_HEADERS, true)
        || $lower === 'server'
        || strpos($lower, 'x-amz-') === 0
        || strpos($lower, 'x-minio-') === 0;
};

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_HTTPHEADER     => $forwardHeaders,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 10,
]);
if ($body !== null && $body !== '') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

if (!$rewriteBody) {
    // ---- Media: stream straight through -----------------------------------
    // Images can be hundreds of KB and the link to the object store is not
    // always fast. Streaming keeps memory flat and starts delivering bytes
    // immediately instead of buffering the whole object first. No overall
    // timeout, but abort if the transfer genuinely stalls.
    curl_setopt_array($ch, [
        CURLOPT_TIMEOUT         => 0,
        CURLOPT_LOW_SPEED_LIMIT => 512,   // bytes/sec
        CURLOPT_LOW_SPEED_TIME  => 30,    // ...sustained for this long
        CURLOPT_HEADERFUNCTION  => function ($ch, $line) use ($hideHeader) {
            $len = strlen($line);
            $trimmed = trim($line);
            if ($trimmed === '') {
                return $len;
            }
            if (stripos($trimmed, 'HTTP/') === 0) {
                $parts = explode(' ', $trimmed);
                if (isset($parts[1])) {
                    http_response_code((int) $parts[1]);
                }
                return $len;
            }
            if (strpos($trimmed, ':') !== false) {
                [$name, $value] = explode(':', $trimmed, 2);
                if (!$hideHeader(strtolower(trim($name)))) {
                    header(trim($name) . ': ' . trim($value), false);
                }
            }
            return $len;
        },
        CURLOPT_WRITEFUNCTION   => function ($ch, $chunk) {
            echo $chunk;
            return strlen($chunk);
        },
    ]);

    if (curl_exec($ch) === false && !headers_sent()) {
        http_response_code(502);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Bad gateway', 'detail' => curl_error($ch)]);
    }
    curl_close($ch);
    exit;
}

// ---- API: buffer, because the body needs rewriting ------------------------
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_TIMEOUT        => 60,
]);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Bad gateway', 'detail' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

$status     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$rawHeaders = substr($response, 0, $headerSize);
$payload    = substr($response, $headerSize);

$contentType = '';
foreach (explode("\r\n", $rawHeaders) as $line) {
    if (stripos($line, 'content-type:') === 0) {
        $contentType = strtolower(trim(substr($line, strlen('content-type:'))));
    }
}

// The API hands back absolute http:// object-store URLs for images. Left alone
// they are mixed content on an https page, so point them back through /media/.
if ($payload !== '' &&
    (strpos($contentType, 'json') !== false || strpos($contentType, 'text/') !== false)) {
    foreach (MEDIA_HOSTS as $slug => $host) {
        $payload = str_replace('http://' . $host . '/', '/media/' . $slug . '/', $payload);
    }
    $payload = str_replace(BACKEND . '/', '/', $payload);
}

http_response_code($status);

foreach (explode("\r\n", $rawHeaders) as $line) {
    if (strpos($line, ':') === false) {
        continue;
    }
    [$name, $value] = explode(':', $line, 2);
    $lower = strtolower(trim($name));
    // Content-Length is dropped too: the rewrite above changed the body size.
    if ($hideHeader($lower) || $lower === 'content-length') {
        continue;
    }
    if ($lower === 'location') {
        foreach (MEDIA_HOSTS as $slug => $host) {
            $value = str_replace('http://' . $host, '/media/' . $slug, $value);
        }
        $value = str_replace(BACKEND, '', $value);
    }
    header(trim($name) . ': ' . trim($value), false);
}

echo $payload;
