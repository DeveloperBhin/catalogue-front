FROM node:18-alpine AS build-stage

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Angular app (production)
RUN npm run build

FROM nginx:alpine AS production-stage

WORKDIR /usr/share/nginx/html

# Copy built app from build stage
COPY --from=build-stage /app/dist/figma-angular-app ./

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

