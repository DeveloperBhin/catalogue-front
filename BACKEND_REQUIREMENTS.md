# Backend Requirements for TARI Products Portal

## Overview

This document outlines the comprehensive backend requirements for the TARI Products Portal. The system consists of:
1. **Manage Catalogue Service**: Internal Spring Boot microservice that manages products and varieties data in RDMS (PostgreSQL)
2. **Gateway Service**: Spring Cloud Gateway that exposes internal microservices APIs
3. **Portal Backend**: Spring Boot backend that fetches data from gateway service and serves the Angular frontend

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Angular Portal │  ←──→   │  Portal Backend   │  ←──→   │ Gateway Service  │
│   (Frontend)    │         │  (Spring Boot)   │         │ (Spring Cloud)   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                    │
                                                                    ↓
                                                          ┌──────────────────────┐
                                                          │ Manage Catalogue      │
                                                          │ Service (Spring Boot) │
                                                          │ + PostgreSQL (RDMS)   │
                                                          │ + MinIO (Images)      │
                                                          └──────────────────────┘
```

## Technology Stack

- **Portal Backend**: Spring Boot 3.x, Java 17+
- **Internal Service**: Spring Boot 3.x (Manage Catalogue Service)
- **Database**: PostgreSQL (RDMS)
- **File Storage**: MinIO (for product images)
- **Service Discovery**: Eureka
- **API Gateway**: Spring Cloud Gateway
- **Image Format**: Base64 encoded strings (stored in MinIO, returned as base64)

## 1. Portal Backend API Endpoints

### 1.1 Get All Products
**Endpoint**: `GET /api/products`

**Description**: Retrieve all products with optional filtering and pagination

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `category` (optional): Filter by category (Cereals, Seeds, Legumes, Vegetables, Fruits, Others)
- `search` (optional): Search term for product name or description

**Response**:
```json
{
  "content": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "category": "string"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Note**: `imageUrl` is returned as base64 encoded string in format: `data:image/{type};base64,{base64String}`

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

### 1.2 Get Product by ID
**Endpoint**: `GET /api/products/{id}`

**Description**: Retrieve a single product with all its varieties

**Path Parameters**:
- `id` (required): Product identifier

**Response**:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "category": "string",
  "varieties": [
    {
      "cropName": "string",
      "varietyReleaseName": "string",
      "releaseEntityOwner": "string",
      "varietyType": "string",
      "productionAltitude": "string",
      "maintainer": "string",
      "maintenanceStatus": "string",
      "potentialYield": "string",
      "specialAttributes": "string",
      "commercialisationLevel": "string",
      "botanicalName": "string",
      "typeOfLicense": "string",
      "recommendedAgriculturalEcologicalZones": "string"
    }
  ]
}
```

**Note**: `imageUrl` is returned as base64 encoded string from MinIO

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Server error

---

### 1.3 Search Products/Varieties
**Endpoint**: `GET /api/products/search`

**Description**: Search across products and varieties

**Query Parameters**:
- `q` (required): Search query
- `type` (optional): Search type - "products", "varieties", or "all" (default: "all")
- `page` (optional): Page number
- `size` (optional): Page size

**Response**:
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "category": "string"
    }
  ],
  "varieties": [
    {
      "varietyReleaseName": "string",
      "cropName": "string",
      "productId": "string",
      "productName": "string"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

---

## 2. Admin/Management API Endpoints (for Tari-Fe)

This section defines the API endpoints for the Manage Catalogue Service that will be consumed by tari-fe (internal frontend) for managing products and varieties.

### 2.1 Products Management Endpoints

#### 2.1.1 Get All Products (Paginated)
**Endpoint**: `GET /api/v1/products/paged`

**Description**: Retrieve paginated list of products for admin management interface

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `category` (optional): Filter by category
- `search` (optional): Search term for product name or description
- `sort` (optional): Sort field (default: "name")
- `direction` (optional): Sort direction - "asc" or "desc" (default: "asc")

**Response Format** (RestData structure):
```json
{
  "itemList": [
    {
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maize",
      "description": "High-yield maize varieties",
      "imageObjectName": "abc123def456.png",
      "category": "Cereals",
      "active": true,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-15T10:30:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### 2.1.2 Get All Products (Non-Paginated)
**Endpoint**: `GET /api/v1/products`

**Description**: Retrieve all products without pagination (for dropdowns, etc.)

**Query Parameters**:
- `category` (optional): Filter by category
- `active` (optional): Filter by active status (default: true)

**Response Format**:
```json
{
  "itemList": [
    {
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maize",
      "category": "Cereals"
    }
  ]
}
```

---

#### 2.1.3 Get Product by UUID
**Endpoint**: `GET /api/v1/products/{uid}`

**Description**: Retrieve a single product by UUID

**Path Parameters**:
- `uid` (required): Product UUID

**Response Format**:
```json
{
  "item": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maize",
    "description": "High-yield maize varieties with excellent nutritional value",
    "imageObjectName": "abc123def456.png",
    "category": "Cereals",
    "active": true,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "createdBy": 1,
    "updatedBy": 1
  }
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Product not found
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

#### 2.1.4 Create Product
**Endpoint**: `POST /api/v1/products`

**Description**: Create a new product

**Request Body**:
```json
{
  "name": "Maize",
  "description": "High-yield maize varieties",
  "category": "Cereals",
  "imageObjectName": "abc123def456.png"
}
```

**Validation Rules**:
- `name`: Required, max 255 characters
- `description`: Optional, text field
- `category`: Required, must be one of: Cereals, Seeds, Legumes, Vegetables, Fruits, Others
- `imageObjectName`: Optional, must be valid MinIO object name

**Response Format**:
```json
{
  "item": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maize",
    "description": "High-yield maize varieties",
    "imageObjectName": "abc123def456.png",
    "category": "Cereals",
    "active": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- `201 Created`: Product created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (requires ROLE_CATALOGUE_MANAGE)
- `500 Internal Server Error`: Server error

---

#### 2.1.5 Update Product
**Endpoint**: `PUT /api/v1/products/{uid}`

**Description**: Update an existing product

**Path Parameters**:
- `uid` (required): Product UUID

**Request Body**:
```json
{
  "name": "Maize (Updated)",
  "description": "Updated description",
  "category": "Cereals",
  "imageObjectName": "newimage123.png",
  "active": true
}
```

**Response Format**: Same as Create Product

**Status Codes**:
- `200 OK`: Product updated successfully
- `400 Bad Request`: Validation error
- `404 Not Found`: Product not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### 2.1.6 Soft Delete Product
**Endpoint**: `DELETE /api/v1/products/{uid}`

**Description**: Soft delete a product (sets deleted flag, does not remove from database)

**Path Parameters**:
- `uid` (required): Product UUID

**Response Format**:
```json
{
  "item": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true,
    "deletedAt": "2026-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Product deleted successfully
- `404 Not Found`: Product not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### 2.1.7 Upload Product Image
**Endpoint**: `POST /api/v1/products/{uid}/image`

**Description**: Upload or update product image to MinIO

**Path Parameters**:
- `uid` (required): Product UUID

**Request Body** (multipart/form-data):
- `file`: Image file (JPEG, PNG, WEBP)
- OR `imageBase64`: Base64 encoded image string with data URI prefix

**Request Body** (JSON with base64):
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Validation Rules**:
- File size: Maximum 5MB
- Allowed formats: JPEG, PNG, WEBP
- Image dimensions: Recommended max 2000x2000px

**Response Format**:
```json
{
  "item": {
    "imageObjectName": "550e8400-e29b-41d4-a716-446655440000_1234567890.png",
    "message": "Image uploaded successfully"
  }
}
```

**Status Codes**:
- `200 OK`: Image uploaded successfully
- `400 Bad Request`: Invalid image format or size
- `404 Not Found`: Product not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### 2.2 Varieties Management Endpoints

#### 2.2.1 Get Varieties for Product (Paginated)
**Endpoint**: `GET /api/v1/products/{uid}/varieties/paged`

**Description**: Retrieve paginated list of varieties for a specific product

**Path Parameters**:
- `uid` (required): Product UUID

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `search` (optional): Search term

**Response Format**:
```json
{
  "itemList": [
    {
      "uid": "660e8400-e29b-41d4-a716-446655440001",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "cropName": "Maize",
      "varietyReleaseName": "TARI-Maize-001",
      "releaseEntityOwner": "Tanzania Agricultural Research Institute",
      "varietyType": "Hybrid",
      "maintenanceStatus": "Active",
      "active": true
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 10,
    "totalPages": 1
  }
}
```

---

#### 2.2.2 Get Variety by UUID
**Endpoint**: `GET /api/v1/varieties/{uid}`

**Description**: Retrieve a single variety by UUID

**Path Parameters**:
- `uid` (required): Variety UUID

**Response Format**:
```json
{
  "item": {
    "uid": "660e8400-e29b-41d4-a716-446655440001",
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "cropName": "Maize",
    "varietyReleaseName": "TARI-Maize-001",
    "releaseEntityOwner": "Tanzania Agricultural Research Institute",
    "varietyType": "Hybrid",
    "productionAltitude": "800-1800 masl",
    "maintainer": "TARI - Ilonga Research Centre",
    "maintenanceStatus": "Active",
    "potentialYield": "6.5-8.0",
    "specialAttributes": "Drought tolerant, high protein content",
    "commercialisationLevel": "Commercial",
    "botanicalName": "Zea mays L.",
    "typeOfLicense": "Open Source",
    "recommendedAgriculturalEcologicalZones": "Eastern, Southern Highlands, Lake Zone",
    "active": true,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
}
```

---

#### 2.2.3 Create Variety
**Endpoint**: `POST /api/v1/varieties`

**Description**: Create a new variety

**Request Body**:
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "cropName": "Maize",
  "varietyReleaseName": "TARI-Maize-001",
  "releaseEntityOwner": "Tanzania Agricultural Research Institute",
  "varietyType": "Hybrid",
  "productionAltitude": "800-1800 masl",
  "maintainer": "TARI - Ilonga Research Centre",
  "maintenanceStatus": "Active",
  "potentialYield": "6.5-8.0",
  "specialAttributes": "Drought tolerant, high protein content",
  "commercialisationLevel": "Commercial",
  "botanicalName": "Zea mays L.",
  "typeOfLicense": "Open Source",
  "recommendedAgriculturalEcologicalZones": "Eastern, Southern Highlands, Lake Zone"
}
```

**Validation Rules**:
- `productId`: Required, must exist
- `cropName`: Required, max 255 characters
- `varietyReleaseName`: Required, max 255 characters
- `releaseEntityOwner`: Required, max 255 characters
- `varietyType`: Required, max 100 characters
- `maintenanceStatus`: Required, max 50 characters
- All other fields: Optional

**Response Format**: Same as Get Variety by UUID

**Status Codes**:
- `201 Created`: Variety created successfully
- `400 Bad Request`: Validation error
- `404 Not Found`: Product not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### 2.2.4 Update Variety
**Endpoint**: `PUT /api/v1/varieties/{uid}`

**Description**: Update an existing variety

**Path Parameters**:
- `uid` (required): Variety UUID

**Request Body**: Same as Create Variety

**Response Format**: Same as Get Variety by UUID

**Status Codes**:
- `200 OK`: Variety updated successfully
- `400 Bad Request`: Validation error
- `404 Not Found`: Variety not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### 2.2.5 Soft Delete Variety
**Endpoint**: `DELETE /api/v1/varieties/{uid}`

**Description**: Soft delete a variety

**Path Parameters**:
- `uid` (required): Variety UUID

**Response Format**:
```json
{
  "item": {
    "uid": "660e8400-e29b-41d4-a716-446655440001",
    "deleted": true,
    "deletedAt": "2026-01-15T10:30:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Variety deleted successfully
- `404 Not Found`: Variety not found
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### 2.3 Bulk Operations

#### 2.3.1 Bulk Create Varieties
**Endpoint**: `POST /api/v1/varieties/bulk`

**Description**: Create multiple varieties at once

**Request Body**:
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "varieties": [
    {
      "cropName": "Maize",
      "varietyReleaseName": "TARI-Maize-001",
      ...
    },
    {
      "cropName": "Maize",
      "varietyReleaseName": "TARI-Maize-002",
      ...
    }
  ]
}
```

**Response Format**:
```json
{
  "itemList": [
    {
      "uid": "660e8400-e29b-41d4-a716-446655440001",
      ...
    }
  ],
  "successCount": 2,
  "errorCount": 0,
  "errors": []
}
```

---

## 3. Data Models

### 2.1 Product Entity (RDMS - PostgreSQL)

**Database Table**: `products`

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_object_name VARCHAR(255),  -- MinIO object name (not full URL)
    category VARCHAR(50),             -- Cereals, Seeds, Legumes, Vegetables, Fruits, Others
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    deleted BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active) WHERE deleted = FALSE;
```

**Java Entity** (following BaseEntity pattern):
```java
@Entity
@Table(name = "products")
public class Product extends BaseEntity {
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_object_name")
    private String imageObjectName;  // MinIO object name
    
    @Column
    private String category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Variety> varieties;
}
```

**DTO for API Response** (Portal Backend):
```typescript
interface Product {
  id: string;                    // UUID from database
  name: string;                  // Product name (e.g., "Maize", "Rice")
  description?: string;           // Product description
  imageUrl?: string;              // Base64 encoded image: "data:image/png;base64,..."
  category?: string;              // Category: Cereals, Seeds, Legumes, Vegetables, Fruits, Others
  varieties?: Variety[];         // Associated varieties
  createdAt?: string;            // ISO 8601 timestamp
  updatedAt?: string;            // ISO 8601 timestamp
}
```

**DTO for Admin API Response** (Tari-Fe - RestData format):
```typescript
// Response wrapper
interface RestData<T> {
  itemList?: T[];                // For list endpoints
  item?: T;                      // For single item endpoints
  page?: {                       // For paginated endpoints
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Product DTO for admin
interface ProductDTO extends BaseEntity {
  uid: string;                   // UUID
  name: string;
  description?: string;
  imageObjectName?: string;       // MinIO object name (not base64)
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

// Request DTO for create/update
interface ProductRequestDTO {
  name: string;
  description?: string;
  category?: string;
  imageObjectName?: string;
  active?: boolean;
}
```

**BaseEntity Interface** (for Tari-Fe):
```typescript
interface BaseEntity {
  uid?: string;                  // UUID
  id?: number;                    // Database ID
  createdAt?: string;             // ISO 8601 timestamp
  updatedAt?: string;             // ISO 8601 timestamp
  createdBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  deletedBy?: number;
  deleted?: boolean;
  active?: boolean;
}
```

### 2.2 Variety Entity (RDMS - PostgreSQL)

**Database Table**: `varieties`

```sql
CREATE TABLE varieties (
    id BIGSERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    product_id BIGINT NOT NULL REFERENCES products(id),
    crop_name VARCHAR(255) NOT NULL,
    variety_release_name VARCHAR(255) NOT NULL,
    release_entity_owner VARCHAR(255) NOT NULL,
    variety_type VARCHAR(100) NOT NULL,
    production_altitude VARCHAR(100),
    maintainer VARCHAR(255),
    maintenance_status VARCHAR(50) NOT NULL,
    potential_yield VARCHAR(50),
    special_attributes TEXT,
    commercialisation_level VARCHAR(100),
    botanical_name VARCHAR(255),
    type_of_license VARCHAR(100),
    recommended_agricultural_ecological_zones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    deleted BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_varieties_product_id ON varieties(product_id);
CREATE INDEX idx_varieties_active ON varieties(active) WHERE deleted = FALSE;
```

**Java Entity** (following BaseEntity pattern):
```java
@Entity
@Table(name = "varieties")
public class Variety extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "crop_name", nullable = false)
    private String cropName;
    
    @Column(name = "variety_release_name", nullable = false)
    private String varietyReleaseName;
    
    @Column(name = "release_entity_owner", nullable = false)
    private String releaseEntityOwner;
    
    @Column(name = "variety_type", nullable = false)
    private String varietyType;
    
    @Column(name = "production_altitude")
    private String productionAltitude;
    
    @Column(name = "maintainer")
    private String maintainer;
    
    @Column(name = "maintenance_status", nullable = false)
    private String maintenanceStatus;
    
    @Column(name = "potential_yield")
    private String potentialYield;
    
    @Column(name = "special_attributes", columnDefinition = "TEXT")
    private String specialAttributes;
    
    @Column(name = "commercialisation_level")
    private String commercialisationLevel;
    
    @Column(name = "botanical_name")
    private String botanicalName;
    
    @Column(name = "type_of_license")
    private String typeOfLicense;
    
    @Column(name = "recommended_agricultural_ecological_zones", columnDefinition = "TEXT")
    private String recommendedAgriculturalEcologicalZones;
}
```

**DTO for API Response** (Portal Backend):
```typescript
interface Variety {
  id?: string;                                    // UUID from database
  cropName: string;                               // Crop name
  varietyReleaseName: string;                     // Variety release name (e.g., "TARI-Maize-001")
  releaseEntityOwner: string;                     // Release entity/owner
  varietyType: string;                            // Variety type (Hybrid, Open Pollinated, Improved Variety, etc.)
  productionAltitude: string;                     // Production altitude range (e.g., "800-1800 masl")
  maintainer: string;                             // Maintainer organization
  maintenanceStatus: string;                       // Maintenance status (Active, Inactive, etc.)
  potentialYield: string;                         // Potential yield (e.g., "6.5-8.0")
  specialAttributes: string;                      // Special attributes at time of release
  commercialisationLevel: string;                 // Commercialisation level
  botanicalName: string;                          // Botanical name (e.g., "Zea mays L.")
  typeOfLicense: string;                          // Type of license
  recommendedAgriculturalEcologicalZones: string; // Recommended zones
  productId?: string;                            // Reference to parent product UUID
  createdAt?: string;                            // ISO 8601 timestamp
  updatedAt?: string;                            // ISO 8601 timestamp
}
```

**DTO for Admin API Response** (Tari-Fe - RestData format):
```typescript
// Variety DTO for admin
interface VarietyDTO extends BaseEntity {
  uid: string;
  productId: string;                             // Product UUID
  cropName: string;
  varietyReleaseName: string;
  releaseEntityOwner: string;
  varietyType: string;
  productionAltitude?: string;
  maintainer?: string;
  maintenanceStatus: string;
  potentialYield?: string;
  specialAttributes?: string;
  commercialisationLevel?: string;
  botanicalName?: string;
  typeOfLicense?: string;
  recommendedAgriculturalEcologicalZones?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request DTO for create/update
interface VarietyRequestDTO {
  productId: string;
  cropName: string;
  varietyReleaseName: string;
  releaseEntityOwner: string;
  varietyType: string;
  productionAltitude?: string;
  maintainer?: string;
  maintenanceStatus: string;
  potentialYield?: string;
  specialAttributes?: string;
  commercialisationLevel?: string;
  botanicalName?: string;
  typeOfLicense?: string;
  recommendedAgriculturalEcologicalZones?: string;
  active?: boolean;
}
```

**Java Request DTOs** (for validation):
```java
// ProductRequestDTO
public class ProductRequestDTO {
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Pattern(regexp = "Cereals|Seeds|Legumes|Vegetables|Fruits|Others", 
             message = "Category must be one of: Cereals, Seeds, Legumes, Vegetables, Fruits, Others")
    private String category;
    
    private String imageObjectName;
    
    private Boolean active = true;
}

// VarietyRequestDTO
public class VarietyRequestDTO {
    @NotNull(message = "Product ID is required")
    private UUID productId;
    
    @NotBlank(message = "Crop name is required")
    @Size(max = 255)
    private String cropName;
    
    @NotBlank(message = "Variety release name is required")
    @Size(max = 255)
    private String varietyReleaseName;
    
    @NotBlank(message = "Release entity owner is required")
    @Size(max = 255)
    private String releaseEntityOwner;
    
    @NotBlank(message = "Variety type is required")
    @Size(max = 100)
    private String varietyType;
    
    @NotBlank(message = "Maintenance status is required")
    @Size(max = 50)
    private String maintenanceStatus;
    
    @Size(max = 100)
    private String productionAltitude;
    
    @Size(max = 255)
    private String maintainer;
    
    @Size(max = 50)
    private String potentialYield;
    
    @Column(columnDefinition = "TEXT")
    private String specialAttributes;
    
    @Size(max = 100)
    private String commercialisationLevel;
    
    @Size(max = 255)
    private String botanicalName;
    
    @Size(max = 100)
    private String typeOfLicense;
    
    @Column(columnDefinition = "TEXT")
    private String recommendedAgriculturalEcologicalZones;
    
    private Boolean active = true;
}
```

---

## 3. Gateway Service Integration

### 3.1 Gateway Service Configuration

The Gateway Service (Spring Cloud Gateway) should be configured to route requests to Manage Catalogue Service.

**Gateway Route Configuration** (Add to `gateway-service/src/main/resources/application-dev.yml`):
```yaml
spring:
  cloud:
    gateway:
      routes:
        # ... existing routes ...
        
        - id: manage-catalogue-service
          uri: lb://MANAGE-CATALOGUE-SERVICE
          predicates:
            - Path=/manage-catalogue-service/**
          filters:
            - StripPrefix=1
```

**Gateway Swagger Configuration** (Add to Swagger URLs):
```yaml
springdoc:
  swagger-ui:
    urls:
      # ... existing services ...
      
      - url: /manage-catalogue-service/v3/api-docs
        name: Manage Catalogue Service
```

**Note**: The Manage Catalogue Service must be registered with Eureka as `MANAGE-CATALOGUE-SERVICE`

### 3.2 Manage Catalogue Service Endpoints (via Gateway)

The Portal Backend should call the following endpoints through the Gateway Service:

#### 3.2.1 Get All Products
**Gateway Endpoint**: `GET {gateway-url}/manage-catalogue-service/api/products`

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `category` (optional): Filter by category
- `search` (optional): Search term

**Expected Response Format**:
```json
{
  "content": [
    {
      "id": "uuid-string",
      "uid": "uuid-string",
      "name": "string",
      "description": "string",
      "imageObjectName": "string",  // MinIO object name
      "category": "string"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Note**: Portal Backend must convert `imageObjectName` to base64 by fetching from MinIO

#### 3.2.2 Get Product Details with Varieties
**Gateway Endpoint**: `GET {gateway-url}/manage-catalogue-service/api/products/{uid}`

**Expected Response Format**:
```json
{
  "id": "uuid-string",
  "uid": "uuid-string",
  "name": "string",
  "description": "string",
  "imageObjectName": "string",  // MinIO object name
  "category": "string",
  "varieties": [
    {
      "id": "uuid-string",
      "cropName": "string",
      "varietyReleaseName": "string",
      "releaseEntityOwner": "string",
      "varietyType": "string",
      "productionAltitude": "string",
      "maintainer": "string",
      "maintenanceStatus": "string",
      "potentialYield": "string",
      "specialAttributes": "string",
      "commercialisationLevel": "string",
      "botanicalName": "string",
      "typeOfLicense": "string",
      "recommendedAgriculturalEcologicalZones": "string"
    }
  ]
}
```

**Note**: Portal Backend must convert `imageObjectName` to base64 by fetching from MinIO

---

## 4. Portal Backend Implementation Requirements

### 4.1 Technology Stack (Spring Boot - Required)

**Portal Backend**:
- Spring Boot 3.3.0+ (matching internal project)
- Java 17+
- Spring Web (REST API)
- Spring Cloud OpenFeign (for gateway service integration)
- Spring Cloud Netflix Eureka Client (for service discovery)
- Spring Cache (for caching)
- Spring Boot Actuator (for monitoring)
- MinIO Java Client (for image retrieval)
- PostgreSQL Driver (if direct DB access needed)
- Lombok (for reducing boilerplate)
- SpringDoc OpenAPI (for API documentation)

### 4.2 Core Functionality

#### 4.2.1 Service Layer
- **ProductService**: Handles product operations
  - Fetch products from gateway service (via Feign client)
  - Convert MinIO object names to base64 images
  - Transform data to match frontend requirements
  - Handle pagination and filtering
  - Cache management

- **VarietyService**: Handles variety operations
  - Fetch varieties for a product
  - Search varieties
  - Data transformation

- **MinioService**: Handles MinIO operations
  - Retrieve images from MinIO by object name
  - Convert images to base64 format
  - Cache base64 images
  - Handle MinIO errors gracefully

- **GatewayServiceClient**: Feign client for gateway service
  - Configure gateway service URL
  - Handle authentication (if required)
  - Handle retries and timeouts
  - Error handling and logging
  - Service discovery via Eureka

#### 4.2.2 Caching Strategy
- **Product List Cache**: Cache all products for 5-10 minutes
- **Product Details Cache**: Cache individual product with varieties for 10-15 minutes
- **Search Results Cache**: Cache search results for 2-5 minutes
- **Base64 Image Cache**: Cache base64 converted images for 30-60 minutes (to avoid repeated MinIO calls)
- Use in-memory cache (Caffeine for Spring Boot) or Redis for distributed caching

#### 4.2.3 Error Handling
- **404 Not Found**: Product or variety not found
- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Gateway connection issues
- **503 Service Unavailable**: Internal gateway unavailable
- Return consistent error response format:
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with id 'xyz' not found",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

#### 4.2.4 Logging
- Log all API requests and responses
- Log internal gateway calls
- Log errors with stack traces
- Use structured logging (JSON format)

---

## 5. Configuration

### 5.1 Application Properties

```yaml
server:
  port: 8082

spring:
  application:
    name: portal-backend-service
  
  # Eureka Service Discovery
  cloud:
    loadbalancer:
      ribbon:
        enabled: false
    openfeign:
      client:
        config:
          default:
            connectTimeout: 5000
            readTimeout: 10000

# Eureka Configuration
eureka:
  client:
    fetch-registry: true
    register-with-eureka: true
    service-url:
      defaultZone: ${EUREKA_DEFAULT_ZONE:http://localhost:8761/eureka/}
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 1
    lease-expiration-duration-in-seconds: 2

# Gateway Service Configuration (via Feign)
gateway:
  service:
    url: http://gateway-service:8080
    base-path: /manage-catalogue-service

# MinIO Configuration (for image retrieval)
minio:
  endpoint: ${MINIO_ENDPOINT:localhost}
  port: ${MINIO_PORT:9000}
  access-key: ${MINIO_ACCESS_KEY:tari}
  secret-key: ${MINIO_SECRET_KEY:tari@2025}
  secure: false
  bucket-name: ${MINIO_BUCKET:tari-media}

# Cache Configuration
cache:
  products:
    ttl: 600000  # 10 minutes
  product-details:
    ttl: 900000  # 15 minutes
  search:
    ttl: 300000  # 5 minutes
  images:
    ttl: 3600000  # 60 minutes (base64 images)

# API Configuration
api:
  products:
    default-page-size: 20
    max-page-size: 100

# CORS Configuration
cors:
  allowed-origins: ${ALLOWED_ORIGINS:http://localhost:4200}
```

### 5.2 Environment Variables

```bash
# Eureka Configuration
EUREKA_DEFAULT_ZONE=http://discovery-service:8761/eureka/

# Gateway Service (if direct URL needed)
GATEWAY_SERVICE_URL=http://gateway-service:8080

# MinIO Configuration
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=tari
MINIO_SECRET_KEY=tari@2025
MINIO_BUCKET=tari-media

# Cache Configuration
CACHE_ENABLED=true

# Logging
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://41.59.228.129:8099
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

#### 6.1.1 Portal Backend Authentication
- Portal Backend may need to authenticate with Gateway Service
- Use API keys, OAuth2, or JWT tokens
- Store credentials securely (environment variables, secrets manager)
- Public endpoints (for Angular Portal) may not require authentication

#### 6.1.2 Manage Catalogue Service Authentication
- All admin endpoints require authentication
- Use OAuth2 Resource Server with JWT tokens (following internal project pattern)
- JWT tokens should be validated on each request
- Token should include user information and permissions

#### 6.1.3 Role-Based Access Control (RBAC)

**Required Roles/Permissions**:

1. **`ROLE_CATALOGUE_MANAGE`** - Full access to catalogue management
   - Can create, update, delete products and varieties
   - Can upload product images
   - Can perform bulk operations
   - Required for all POST, PUT, DELETE endpoints

2. **`ROLE_CATALOGUE_VIEW`** - Read-only access
   - Can view products and varieties
   - Can access product/variety details
   - Required for all GET endpoints (admin interface)

3. **Public Access** - No authentication required
   - Portal Backend public endpoints (for Angular Portal)
   - Read-only product listing
   - Product details with varieties

**Permission Mapping**:

| Endpoint | Method | Required Permission |
|----------|--------|---------------------|
| `/api/v1/products/paged` | GET | `ROLE_CATALOGUE_VIEW` |
| `/api/v1/products` | GET | `ROLE_CATALOGUE_VIEW` |
| `/api/v1/products/{uid}` | GET | `ROLE_CATALOGUE_VIEW` |
| `/api/v1/products` | POST | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/products/{uid}` | PUT | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/products/{uid}` | DELETE | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/products/{uid}/image` | POST | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/varieties/{uid}` | GET | `ROLE_CATALOGUE_VIEW` |
| `/api/v1/varieties` | POST | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/varieties/{uid}` | PUT | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/varieties/{uid}` | DELETE | `ROLE_CATALOGUE_MANAGE` |
| `/api/v1/varieties/bulk` | POST | `ROLE_CATALOGUE_MANAGE` |

**Implementation Pattern** (Spring Security):

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    @GetMapping("/paged")
    @PreAuthorize("hasRole('ROLE_CATALOGUE_VIEW')")
    public ResponseEntity<RestData<ProductDTO>> getProductsPaged(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size
    ) {
        // Implementation
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_CATALOGUE_MANAGE')")
    public ResponseEntity<RestData<ProductDTO>> createProduct(
        @RequestBody @Valid ProductRequestDTO request
    ) {
        // Implementation
    }
}
```

#### 6.1.4 JWT Token Structure

JWT tokens should include:
```json
{
  "sub": "user@example.com",
  "roles": ["ROLE_CATALOGUE_MANAGE", "ROLE_CATALOGUE_VIEW"],
  "userId": 123,
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 6.2 CORS Configuration

#### 6.2.1 Portal Backend CORS
- Allow requests from Angular Portal domain
- Configure appropriate headers
- Handle preflight requests
- Allow credentials if needed

#### 6.2.2 Manage Catalogue Service CORS
- Allow requests from tari-fe domain
- Allow requests from Gateway Service
- Configure appropriate headers
- Handle preflight requests

**Example Configuration** (Spring Boot):
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",  // Angular Portal
            "http://tari-fe:4200",    // Tari-Fe
            "http://gateway-service:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 6.3 Rate Limiting

#### 6.3.1 Portal Backend Rate Limiting
- Implement rate limiting to prevent abuse
- Recommended: 100 requests per minute per IP
- Return `429 Too Many Requests` when limit exceeded
- Exempt authenticated admin users from strict limits

#### 6.3.2 Manage Catalogue Service Rate Limiting
- Admin endpoints: 200 requests per minute per user
- Public endpoints: 100 requests per minute per IP
- Image upload endpoints: 10 requests per minute per user
- Return `429 Too Many Requests` with retry-after header

### 6.4 Input Validation

#### 6.4.1 Request Validation
- Validate all input parameters
- Use Bean Validation annotations (@NotNull, @NotBlank, @Size, etc.)
- Sanitize user input to prevent injection attacks
- Validate file uploads (size, type, content)

#### 6.4.2 Image Upload Security
- Validate image file types (JPEG, PNG, WEBP only)
- Validate image file size (max 5MB)
- Scan uploaded images for malicious content
- Store images with UUID-based names to prevent path traversal
- Validate base64 image format before processing

### 6.5 Data Security

#### 6.5.1 Database Security
- Use parameterized queries to prevent SQL injection
- Implement soft delete (do not permanently delete records)
- Audit trail for all create/update/delete operations
- Encrypt sensitive data if required

#### 6.5.2 MinIO Security
- Use secure credentials for MinIO access
- Implement bucket policies
- Validate object names to prevent path traversal
- Set appropriate access permissions

---

## 7. Data Transformation

### 7.1 Gateway Service to Portal Format Transformation
The Portal Backend should transform data from gateway service format to match frontend requirements:

**Example Transformation**:
```java
// Gateway Service Response (from Manage Catalogue Service)
{
  "uid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Maize",
  "imageObjectName": "abc123def456.png",
  "varieties": [...]
}

// Transform to Portal Format
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Maize",
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "varieties": [...]
}
```

### 7.2 MinIO Image to Base64 Conversion
The Portal Backend must:
1. Receive `imageObjectName` from gateway service
2. Fetch image from MinIO using object name
3. Convert image InputStream to base64 string
4. Format as: `data:image/{type};base64,{base64String}`
5. Cache the base64 string to avoid repeated MinIO calls

**Implementation Pattern** (following internal project):
```java
@Service
public class MinioService {
    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    
    public String getImageAsBase64(String objectName) {
        try {
            // Get object from MinIO
            InputStream is = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(objectName)
                    .build()
            );
            
            // Convert to base64
            byte[] bytes = IOUtils.toByteArray(is);
            String base64 = Base64.getEncoder().encodeToString(bytes);
            
            // Determine content type from object name
            String contentType = getContentType(objectName);
            
            // Return formatted base64 string
            return "data:" + contentType + ";base64," + base64;
        } catch (Exception e) {
            log.error("Error fetching image from MinIO: {}", e.getMessage());
            return null; // or fallback image
        }
    }
}
```

### 7.3 Image Handling Best Practices
- Cache base64 images for 30-60 minutes
- Handle missing images gracefully (return null or fallback)
- Support common image formats: PNG, JPG, JPEG, WEBP
- Validate image size before encoding
- Provide fallback placeholder if image fails to load

---

## 8. Performance Optimization

### 8.1 Caching
- Implement multi-level caching (in-memory + Redis)
- Cache frequently accessed products
- Invalidate cache on updates

### 8.2 Pagination
- Implement server-side pagination
- Default page size: 20 items
- Maximum page size: 100 items

### 8.3 Lazy Loading
- Load varieties only when product details are requested
- Don't include varieties in product list endpoint

### 8.4 Response Compression
- Enable GZIP compression for API responses
- Reduce payload size for mobile clients

---

## 9. Monitoring & Health Checks

### 9.1 Health Endpoints
- `GET /actuator/health`: Application health
- `GET /actuator/health/gateway`: Internal gateway connectivity
- `GET /actuator/metrics`: Application metrics

### 9.2 Metrics to Track
- API request count and response times
- Internal gateway call success/failure rates
- Cache hit/miss ratios
- Error rates by endpoint

---

## 10. API Documentation

### 10.1 OpenAPI/Swagger
- Generate API documentation using OpenAPI 3.0
- Include request/response examples
- Document error responses
- Endpoint: `GET /swagger-ui.html` or `/api-docs`

---

## 11. Testing Requirements

### 11.1 Unit Tests
- Test service layer methods
- Test data transformation logic
- Test error handling

### 11.2 Integration Tests
- Test internal gateway integration
- Test caching behavior
- Test API endpoints

### 11.3 Mock Internal Gateway
- Create mock server for internal gateway
- Test error scenarios (timeout, 500, 404)
- Test retry logic

---

## 12. Deployment Considerations

### 12.1 Containerization
- Dockerize the application
- Use multi-stage builds
- Optimize image size

### 12.2 Environment-Specific Configuration
- Development: Connect to dev internal gateway
- Staging: Connect to staging internal gateway
- Production: Connect to production internal gateway

### 12.3 Scaling
- Stateless application design
- Horizontal scaling support
- Load balancer configuration

---

## 13. Sample Implementation Structure (Spring Boot)

Following the internal project pattern:

```
src/
├── main/
│   ├── java/
│   │   └── tz/go/tari/portal_backend/
│   │       ├── PortalBackendApplication.java
│   │       ├── config/
│   │       │   ├── CacheConfig.java
│   │       │   ├── FeignConfig.java
│   │       │   ├── WebConfig.java
│   │       │   ├── CorsConfig.java
│   │       │   └── MinioConfig.java
│   │       ├── controller/
│   │       │   └── ProductController.java
│   │       ├── service/
│   │       │   ├── ProductService.java
│   │       │   ├── ProductServiceImpl.java
│   │       │   ├── VarietyService.java
│   │       │   ├── MinioService.java
│   │       │   └── MinioServiceImpl.java
│   │       ├── client/
│   │       │   └── ManageCatalogueServiceClient.java  // Feign client
│   │       ├── dto/
│   │       │   ├── ProductDTO.java
│   │       │   ├── VarietyDTO.java
│   │       │   └── ProductResponseDTO.java
│   │       ├── utility/
│   │       │   ├── Base64Converter.java  // Following internal project pattern
│   │       │   └── ImageUtil.java
│   │       ├── exception/
│   │       │   ├── GlobalExceptionHandler.java
│   │       │   └── ProductNotFoundException.java
│   │       └── kasha/  // MinIO utilities (following internal project naming)
│   │           ├── config/
│   │           │   └── MinioProperties.java
│   │           └── utils/
│   │               └── MinioUtil.java
│   └── resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── application-prod.yml
└── test/
    └── java/
        └── tz/go/tari/portal_backend/
            └── service/
                └── ProductServiceTest.java
```

**POM.xml Dependencies** (following internal project):
```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    
    <!-- MinIO -->
    <dependency>
        <groupId>io.minio</groupId>
        <artifactId>minio</artifactId>
        <version>8.5.10</version>
    </dependency>
    
    <!-- Apache Commons IO (for Base64 conversion) -->
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.11.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    
    <!-- SpringDoc OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.5.0</version>
    </dependency>
    
    <!-- Caffeine Cache -->
    <dependency>
        <groupId>com.github.ben-manes.caffeine</groupId>
        <artifactId>caffeine</artifactId>
    </dependency>
</dependencies>
```

---

## 14. API Response Examples

### 14.1 Get All Products
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maize",
      "description": "High-yield maize varieties with excellent nutritional value",
      "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "category": "Cereals"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Rice",
      "description": "Premium rice varieties adapted for local growing conditions",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      "category": "Cereals"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 20,
    "totalPages": 1
  }
}
```

### 14.2 Get Product by ID
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Maize",
  "description": "High-yield maize varieties with excellent nutritional value and drought resistance",
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "category": "Cereals",
  "varieties": [
    {
      "cropName": "Maize",
      "varietyReleaseName": "TARI-Maize-001",
      "releaseEntityOwner": "Tanzania Agricultural Research Institute",
      "varietyType": "Hybrid",
      "productionAltitude": "800-1800 masl",
      "maintainer": "TARI - Ilonga Research Centre",
      "maintenanceStatus": "Active",
      "potentialYield": "6.5-8.0",
      "specialAttributes": "Drought tolerant, high protein content, early maturing",
      "commercialisationLevel": "Commercial",
      "botanicalName": "Zea mays L.",
      "typeOfLicense": "Open Source",
      "recommendedAgriculturalEcologicalZones": "Eastern, Southern Highlands, Lake Zone"
    }
  ]
}
```

**Note**: `imageUrl` is always returned as base64 encoded string in the format: `data:image/{type};base64,{base64String}`

---

## 15. Error Response Examples

### 15.1 Product Not Found
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with id 'invalid-id' not found",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### 15.2 Internal Gateway Unavailable
```json
{
  "error": {
    "code": "GATEWAY_UNAVAILABLE",
    "message": "Internal gateway is currently unavailable. Please try again later.",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### 15.3 Invalid Request
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid page size. Maximum allowed: 100",
    "timestamp": "2026-01-15T10:30:00Z",
    "details": {
      "field": "size",
      "value": 200,
      "constraint": "max=100"
    }
  }
}
```

---

## 16. Next Steps

1. **Review and Confirm**: Review this document with the backend team
2. **Internal Gateway API**: Confirm the exact API structure from internal gateway
3. **Technology Selection**: Choose backend technology (Spring Boot recommended)
4. **Implementation**: Start with basic endpoints (Get All Products, Get Product by ID)
5. **Testing**: Set up mock internal gateway for testing
6. **Integration**: Integrate with actual internal gateway
7. **Deployment**: Deploy to development environment
8. **Frontend Integration**: Update Angular service to use new backend APIs

---

## 17. Manage Catalogue Service Requirements

### 17.1 Service Name
- **Service Name**: `manage-catalogue-service`
- **Eureka Service ID**: `MANAGE-CATALOGUE-SERVICE`
- **Gateway Route**: `/manage-catalogue-service/**`

### 17.2 Database Schema (PostgreSQL - RDMS)

**Products Table**:
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_object_name VARCHAR(255),  -- MinIO object name
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    deleted BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE
);
```

**Varieties Table**:
```sql
CREATE TABLE varieties (
    id BIGSERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    product_id BIGINT NOT NULL REFERENCES products(id),
    crop_name VARCHAR(255) NOT NULL,
    variety_release_name VARCHAR(255) NOT NULL,
    release_entity_owner VARCHAR(255) NOT NULL,
    variety_type VARCHAR(100) NOT NULL,
    production_altitude VARCHAR(100),
    maintainer VARCHAR(255),
    maintenance_status VARCHAR(50) NOT NULL,
    potential_yield VARCHAR(50),
    special_attributes TEXT,
    commercialisation_level VARCHAR(100),
    botanical_name VARCHAR(255),
    type_of_license VARCHAR(100),
    recommended_agricultural_ecological_zones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    deleted BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE
);
```

### 17.3 Manage Catalogue Service API Endpoints

The Manage Catalogue Service should expose the following endpoints (accessible via Gateway Service at `/manage-catalogue-service/api/v1/...`):

#### Products Endpoints

1. **`GET /api/v1/products/paged`** - Get paginated products list
   - Query params: `page`, `size`, `category`, `search`, `sort`, `direction`
   - Response: RestData format with `itemList` and `page`
   - Returns: `imageObjectName` (MinIO object name), not base64

2. **`GET /api/v1/products`** - Get all products (non-paginated)
   - Query params: `category`, `active`
   - Response: RestData format with `itemList`
   - Returns: `imageObjectName` (MinIO object name), not base64

3. **`GET /api/v1/products/{uid}`** - Get product by UUID
   - Response: RestData format with `item`
   - Returns: `imageObjectName` (MinIO object name), not base64
   - Does NOT include varieties (use separate endpoint)

4. **`POST /api/v1/products`** - Create product (admin only)
   - Request: ProductRequestDTO
   - Response: RestData format with `item`
   - Requires: `ROLE_CATALOGUE_MANAGE` permission

5. **`PUT /api/v1/products/{uid}`** - Update product (admin only)
   - Request: ProductRequestDTO
   - Response: RestData format with `item`
   - Requires: `ROLE_CATALOGUE_MANAGE` permission

6. **`DELETE /api/v1/products/{uid}`** - Soft delete product (admin only)
   - Response: RestData format with `item` (deleted flag set)
   - Requires: `ROLE_CATALOGUE_MANAGE` permission

7. **`POST /api/v1/products/{uid}/image`** - Upload product image (admin only)
   - Request: multipart/form-data with `file` OR JSON with `imageBase64`
   - Response: RestData format with `item.imageObjectName`
   - Requires: `ROLE_CATALOGUE_MANAGE` permission

#### Varieties Endpoints

8. **`GET /api/v1/products/{uid}/varieties/paged`** - Get paginated varieties for product
   - Query params: `page`, `size`, `search`
   - Response: RestData format with `itemList` and `page`

9. **`GET /api/v1/products/{uid}/varieties`** - Get all varieties for product (non-paginated)
   - Response: RestData format with `itemList`

10. **`GET /api/v1/varieties/{uid}`** - Get variety by UUID
    - Response: RestData format with `item`

11. **`POST /api/v1/varieties`** - Create variety (admin only)
    - Request: VarietyRequestDTO
    - Response: RestData format with `item`
    - Requires: `ROLE_CATALOGUE_MANAGE` permission

12. **`PUT /api/v1/varieties/{uid}`** - Update variety (admin only)
    - Request: VarietyRequestDTO
    - Response: RestData format with `item`
    - Requires: `ROLE_CATALOGUE_MANAGE` permission

13. **`DELETE /api/v1/varieties/{uid}`** - Soft delete variety (admin only)
    - Response: RestData format with `item` (deleted flag set)
    - Requires: `ROLE_CATALOGUE_MANAGE` permission

14. **`POST /api/v1/varieties/bulk`** - Bulk create varieties (admin only)
    - Request: BulkVarietyRequestDTO with `productId` and `varieties[]`
    - Response: RestData format with `itemList`, `successCount`, `errorCount`, `errors[]`
    - Requires: `ROLE_CATALOGUE_MANAGE` permission

#### Response Format Standard

All endpoints must return data in **RestData** format:

```json
{
  "itemList": [...],      // For list endpoints (paginated or non-paginated)
  "item": {...},          // For single item endpoints
  "page": {              // For paginated endpoints only
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Important Notes**:
- All admin endpoints return `imageObjectName` (MinIO object name), NOT base64
- Portal Backend is responsible for converting `imageObjectName` to base64
- All timestamps are in ISO 8601 format
- All UUIDs are in standard UUID format
- Soft delete endpoints set `deleted=true` and `deletedAt` timestamp, but do not remove records

### 17.4 MinIO Integration in Manage Catalogue Service

- Store product images in MinIO bucket: `tari-media`
- Store image object name in database (`image_object_name` field)
- Use UUID-based object names for uniqueness
- Support image upload via multipart/form-data or base64

---

## 18. Tari-Fe Integration Guide

This section provides comprehensive guidance for implementing the Catalogue Management module in tari-fe (internal frontend) following established patterns.

### 18.1 Module Structure

Create the following module structure in `tari-fe/src/app/modules/`:

```
catalogue-management/
  products/
    products.component.ts          # Extends BaseComponent
    products.component.html        # Uses app-data-table-hybrid
    products.component.scss
    products.service.ts            # Uses FetchService
    products.model.ts              # Extends BaseEntity
    product-form.fields.ts         # FieldConfig[] array
    product-details.component.ts
    product-details.component.html
    product-details.component.scss
  varieties/
    varieties.component.ts
    varieties.component.html
    varieties.component.scss
    varieties.service.ts
    varieties.model.ts
    variety-form.fields.ts
    variety-details.component.ts
    variety-details.component.html
    variety-details.component.scss
  catalogue-management.module.ts
  catalogue-management-routing.module.ts
```

### 18.2 Service Implementation Pattern

#### 18.2.1 Products Service

**File**: `products.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { FetchOpt, FetchService } from '@shared';
import { RestPage, RestData } from '@shared/fetch/custom-responce';
import { Observable, map } from 'rxjs';
import { ProductModel } from './products.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private fs = inject(FetchService);

  listPath = 'manage-catalogue-service/api/v1/products/paged';
  listAllPath = 'manage-catalogue-service/api/v1/products';
  savePath = 'manage-catalogue-service/api/v1/products';
  imageUploadPath = 'manage-catalogue-service/api/v1/products';

  getProductsList(page: RestPage): Observable<RestData<any>> {
    return this.fs.get(this.listPath, page);
  }

  getAllProducts(): Observable<RestData<any>> {
    return this.fs.get(this.listAllPath);
  }

  getProductByUid(uid: string): Observable<ProductModel> {
    return this.fs.get(`${this.savePath}/${uid}`, {}).pipe(map(d => d?.item));
  }

  saveProduct(formData: any, opt?: FetchOpt): Observable<any> {
    return this.fs.post(this.savePath, formData, opt);
  }

  updateProduct(model: ProductModel, data: any, opt?: FetchOpt): Observable<ProductModel> {
    return <any>this.fs.put(`${this.savePath}/${model.uid}`, data, opt);
  }

  deleteProduct(model: ProductModel, opt?: FetchOpt): Observable<ProductModel> {
    return <any>this.fs.delete(`${this.savePath}/${model.uid}`, opt).pipe(map(d => d?.item));
  }

  uploadProductImage(uid: string, imageBase64: string, opt?: FetchOpt): Observable<any> {
    return this.fs.post(`${this.imageUploadPath}/${uid}/image`, { imageBase64 }, opt);
  }
}
```

#### 18.2.2 Varieties Service

**File**: `varieties.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { FetchOpt, FetchService } from '@shared';
import { RestPage, RestData } from '@shared/fetch/custom-responce';
import { Observable, map } from 'rxjs';
import { VarietyModel } from './varieties.model';

@Injectable({
  providedIn: 'root',
})
export class VarietiesService {
  private fs = inject(FetchService);

  listPath = 'manage-catalogue-service/api/v1/varieties/paged';
  savePath = 'manage-catalogue-service/api/v1/varieties';
  bulkPath = 'manage-catalogue-service/api/v1/varieties/bulk';

  getVarietiesForProduct(productUid: string, page: RestPage): Observable<RestData<any>> {
    return this.fs.get(`manage-catalogue-service/api/v1/products/${productUid}/varieties/paged`, page);
  }

  getAllVarietiesForProduct(productUid: string): Observable<RestData<any>> {
    return this.fs.get(`manage-catalogue-service/api/v1/products/${productUid}/varieties`);
  }

  getVarietyByUid(uid: string): Observable<VarietyModel> {
    return this.fs.get(`${this.savePath}/${uid}`, {}).pipe(map(d => d?.item));
  }

  saveVariety(formData: any, opt?: FetchOpt): Observable<any> {
    return this.fs.post(this.savePath, formData, opt);
  }

  updateVariety(model: VarietyModel, data: any, opt?: FetchOpt): Observable<VarietyModel> {
    return <any>this.fs.put(`${this.savePath}/${model.uid}`, data, opt);
  }

  deleteVariety(model: VarietyModel, opt?: FetchOpt): Observable<VarietyModel> {
    return <any>this.fs.delete(`${this.savePath}/${model.uid}`, opt).pipe(map(d => d?.item));
  }

  bulkCreateVarieties(productUid: string, varieties: any[], opt?: FetchOpt): Observable<any> {
    return this.fs.post(this.bulkPath, { productId: productUid, varieties }, opt);
  }
}
```

### 18.3 Component Implementation Pattern

#### 18.3.1 Products List Component

**File**: `products.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionButton, FetchOpt, FormParameters, ViewService } from '@shared';
import { FieldConfig } from '@shared/components/dynamic-forms-components/field.interface';
import { FormComponent } from '@shared/components/form/form.component';
import { lastValueFrom, map } from 'rxjs';
import { BaseComponent } from '@shared/view/base-component';
import { RestPage } from '@shared/fetch/custom-responce';
import { ProductModel } from './products.model';
import { ProductsService } from './products.service';
import { getProductFormFields } from './product-form.fields';
import { createGenericAction } from '@store/entities/base-entity/base-entity.actions';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent extends BaseComponent implements OnInit {
  title = 'Products';

  router = inject(Router);
  productData: ProductModel[];
  productService = inject(ProductsService);
  productSuccess = createGenericAction('Success');

  slug = this.productService.listPath;
  columnKeys = [
    'name',
    'category',
    'description',
    'active',
    'createdAt',
  ];
  searchKeys = ['name', 'description', 'category'];

  restPage: RestPage;

  ngOnInit(): void {
    this.setButtons();
    this.loadData();
  }

  async setButtons() {
    this.actionButtons = [
      {
        type: 'button',
        label: 'New Product',
        icon: 'add',
        permissions: ['ROLE_CATALOGUE_MANAGE'],
        onClick: () => this.openProductForm(),
      },
    ];

    this.tableButtons = [
      {
        icon: 'more_actions',
        type: 'icon',
        class: 'border',
        buttons: [
          {
            label: 'View Details',
            icon: 'view',
            onClick: details => this.navigateToProductDetails(details),
          },
          {
            label: 'Manage Varieties',
            icon: 'list',
            onClick: product => this.navigateToVarieties(product),
            permissions: ['ROLE_CATALOGUE_MANAGE'],
          },
          {
            label: 'Edit Product',
            icon: 'edit',
            onClick: data => this.openProductForm(data),
            permissions: ['ROLE_CATALOGUE_MANAGE'],
          },
          {
            label: 'Delete Product',
            icon: 'delete',
            confirmMessageMapper: data => `Deleting <b>${data?.name}</b>, Are you sure?`,
            onClick: data => this.deleteProduct(data),
            permissions: ['ROLE_CATALOGUE_MANAGE'],
          },
        ],
      },
    ];
  }

  async loadData(page?: RestPage) {
    if (page) this.restPage = page;
    let data$ = this.productService.getProductsList(this.restPage);
    this.productData = await lastValueFrom(data$.pipe(map(data => data?.itemList ?? [])));
  }

  openProductForm(data?: ProductModel) {
    let onSubmit = async formData => {
      let opt: FetchOpt = { successActions: this.productSuccess };
      let data$ = this.productService.saveProduct(formData, opt);
      if (!!data) data$ = this.productService.updateProduct(data, formData, opt);

      await lastValueFrom(data$);
      this.loadData();
    };

    let fp: FormParameters = {
      onSubmit,
      model: { ...data },
      closeAfterSubmit: true,
      fields: getProductFormFields(this),
      linearSteppers: false,
      title: `${!!data ? 'Edit' : 'Add New'} Product`,
    };

    this.vs.openModal(FormComponent, fp, '70%');
  }

  async deleteProduct(data?: ProductModel) {
    await lastValueFrom(this.productService.deleteProduct(data));
    this.loadData();
  }

  navigateToProductDetails(details: ProductModel) {
    this.router.navigateByUrl(`catalogue-management/products/${details.uid}/details`);
  }

  navigateToVarieties(product: ProductModel) {
    this.router.navigateByUrl(`catalogue-management/products/${product.uid}/varieties`);
  }
}
```

**File**: `products.component.html`

```html
<page-header [actionButtons]="actionButtons" [title]="title"></page-header>

<app-data-table-hybrid class="d-block mt-2"
                       [slug]="slug"
                       [isPageable]="true"
                       [tableData]="productData"
                       [actionButtons]="tableButtons"
                       [searchKeys]="searchKeys"
                       [name]="title"
                       [columnsKeys]="columnKeys"
                       (pageable)="loadData($event)"></app-data-table-hybrid>
```

### 18.4 Form Field Definitions

#### 18.4.1 Product Form Fields

**File**: `product-form.fields.ts`

```typescript
import {
  FieldConfig,
  FieldType,
} from '@shared/components/dynamic-forms-components/field.interface';
import {
  REQUIRED_VALIDATOR,
} from '@shared/components/dynamic-forms-components/forms-constants';
import { ProductsComponent } from './products.component';

export const getProductFormFields = (base: ProductsComponent): FieldConfig[] => [
  {
    key: 'name',
    label: 'Product Name',
    type: FieldType.input,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    appearance: 'outline',
    rowClass: 'large',
  },
  {
    key: 'category',
    label: 'Category',
    type: FieldType.select,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
    options: [
      { name: 'Cereals', value: 'Cereals' },
      { name: 'Seeds', value: 'Seeds' },
      { name: 'Legumes', value: 'Legumes' },
      { name: 'Vegetables', value: 'Vegetables' },
      { name: 'Fruits', value: 'Fruits' },
      { name: 'Others', value: 'Others' },
    ],
  },
  {
    key: 'imageBase64',
    label: 'Product Image',
    type: FieldType.file,
    appearance: 'outline',
    rowClass: 'medium',
    accept: 'image/*',
    description: 'Upload product image (JPEG, PNG, WEBP, max 5MB)',
  },
  {
    key: 'active',
    label: 'Active',
    type: FieldType.checkbox,
    appearance: 'outline',
    rowClass: 'medium',
    defaultValue: true,
  },
  {
    type: FieldType.button,
    label: 'Save',
    rowClass: 'large',
    color: 'primary',
  },
];
```

#### 18.4.2 Variety Form Fields

**File**: `variety-form.fields.ts`

```typescript
import {
  FieldConfig,
  FieldType,
} from '@shared/components/dynamic-forms-components/field.interface';
import {
  REQUIRED_VALIDATOR,
} from '@shared/components/dynamic-forms-components/forms-constants';
import { VarietiesComponent } from './varieties.component';

export const getVarietyFormFields = (base: VarietiesComponent): FieldConfig[] => [
  {
    key: 'cropName',
    label: 'Crop Name',
    type: FieldType.input,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'varietyReleaseName',
    label: 'Variety Release Name',
    type: FieldType.input,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'releaseEntityOwner',
    label: 'Release Entity/Owner',
    type: FieldType.input,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'varietyType',
    label: 'Variety Type',
    type: FieldType.select,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
    options: [
      { name: 'Hybrid', value: 'Hybrid' },
      { name: 'Open Pollinated', value: 'Open Pollinated' },
      { name: 'Improved Variety', value: 'Improved Variety' },
      { name: 'Other', value: 'Other' },
    ],
  },
  {
    key: 'productionAltitude',
    label: 'Production Altitude',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
    placeholder: 'e.g., 800-1800 masl',
  },
  {
    key: 'maintainer',
    label: 'Maintainer',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'maintenanceStatus',
    label: 'Maintenance Status',
    type: FieldType.select,
    validations: [REQUIRED_VALIDATOR],
    appearance: 'outline',
    rowClass: 'medium',
    options: [
      { name: 'Active', value: 'Active' },
      { name: 'Inactive', value: 'Inactive' },
      { name: 'Discontinued', value: 'Discontinued' },
    ],
  },
  {
    key: 'potentialYield',
    label: 'Potential Yield (MT/ha)',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
    placeholder: 'e.g., 6.5-8.0',
  },
  {
    key: 'specialAttributes',
    label: 'Special Attributes',
    type: FieldType.textarea,
    appearance: 'outline',
    rowClass: 'large',
    placeholder: 'Special attributes at the time of release',
  },
  {
    key: 'commercialisationLevel',
    label: 'Commercialisation Level',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'botanicalName',
    label: 'Botanical Name',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
    placeholder: 'e.g., Zea mays L.',
  },
  {
    key: 'typeOfLicense',
    label: 'Type of License',
    type: FieldType.input,
    appearance: 'outline',
    rowClass: 'medium',
  },
  {
    key: 'recommendedAgriculturalEcologicalZones',
    label: 'Recommended Agricultural Ecological Zones',
    type: FieldType.textarea,
    appearance: 'outline',
    rowClass: 'large',
  },
  {
    key: 'active',
    label: 'Active',
    type: FieldType.checkbox,
    appearance: 'outline',
    rowClass: 'medium',
    defaultValue: true,
  },
  {
    type: FieldType.button,
    label: 'Save',
    rowClass: 'large',
    color: 'primary',
  },
];
```

### 18.5 Routing Configuration

**File**: `catalogue-management-routing.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { VarietiesComponent } from './varieties/varieties.component';
import { VarietyDetailsComponent } from './varieties/variety-details/variety-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductsComponent,
    data: { permission: 'ROLE_CATALOGUE_VIEW' },
  },
  {
    path: 'products/:uid/details',
    component: ProductDetailsComponent,
    data: { permission: 'ROLE_CATALOGUE_VIEW' },
  },
  {
    path: 'products/:uid/varieties',
    component: VarietiesComponent,
    data: { permission: 'ROLE_CATALOGUE_VIEW' },
  },
  {
    path: 'varieties/:uid/details',
    component: VarietyDetailsComponent,
    data: { permission: 'ROLE_CATALOGUE_VIEW' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogueManagementRoutingModule {}
```

### 18.6 Model Interfaces

#### 18.6.1 Product Model

**File**: `products.model.ts`

```typescript
import { BaseEntity } from '@store/BaseEntity.model';

export interface ProductModel extends BaseEntity {
  name?: string;
  description?: string;
  imageObjectName?: string;
  category?: string;
  active?: boolean;
}
```

#### 18.6.2 Variety Model

**File**: `varieties.model.ts`

```typescript
import { BaseEntity } from '@store/BaseEntity.model';

export interface VarietyModel extends BaseEntity {
  productId?: string;
  cropName?: string;
  varietyReleaseName?: string;
  releaseEntityOwner?: string;
  varietyType?: string;
  productionAltitude?: string;
  maintainer?: string;
  maintenanceStatus?: string;
  potentialYield?: string;
  specialAttributes?: string;
  commercialisationLevel?: string;
  botanicalName?: string;
  typeOfLicense?: string;
  recommendedAgriculturalEcologicalZones?: string;
  active?: boolean;
}
```

### 18.7 Image Upload Handling

When uploading images in the form, convert the file to base64 before submitting:

```typescript
// In component
async handleImageUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// In form submission
async onSubmit(formData: any) {
  if (formData.imageFile) {
    formData.imageBase64 = await this.handleImageUpload(formData.imageFile);
    delete formData.imageFile;
  }
  // Submit formData with imageBase64
}
```

---

## 19. Questions to Clarify

1. What is the exact API structure of the Manage Catalogue Service?
2. Does the gateway service require authentication? What type (OAuth2, JWT)?
3. What is the Eureka service discovery URL?
4. Are there any rate limits on the gateway service?
5. Should the portal backend implement any additional business logic?
6. Do we need real-time updates or is caching sufficient?
7. What is the expected load/traffic volume?
8. Are there any specific security requirements for the portal backend?
9. Should the portal backend register with Eureka or call gateway directly?
10. What is the MinIO bucket name for product images?

---

## 19. Implementation Code Examples

### 19.1 Feign Client for Manage Catalogue Service

```java
package tz.go.tari.portal_backend.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import tz.go.tari.portal_backend.dto.ProductResponseDTO;
import tz.go.tari.portal_backend.dto.ProductListResponseDTO;

@FeignClient(
    name = "MANAGE-CATALOGUE-SERVICE",
    url = "${gateway.service.url:http://gateway-service:8080}",
    path = "/manage-catalogue-service/api"
)
public interface ManageCatalogueServiceClient {
    
    @GetMapping("/products")
    ProductListResponseDTO getAllProducts(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search
    );
    
    @GetMapping("/products/{uid}")
    ProductResponseDTO getProductByUid(@PathVariable String uid);
}
```

### 19.2 MinIO Service Implementation

```java
package tz.go.tari.portal_backend.kasha.services;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import tz.go.tari.portal_backend.kasha.config.MinioProperties;

import java.io.InputStream;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {
    
    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    
    @Override
    @Cacheable(value = "images", key = "#objectName")
    public String getImageAsBase64(String objectName) {
        if (objectName == null || objectName.isEmpty()) {
            return null;
        }
        
        try {
            // Get object from MinIO
            InputStream is = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(objectName)
                    .build()
            );
            
            // Convert to base64
            byte[] bytes = IOUtils.toByteArray(is);
            String base64 = Base64.getEncoder().encodeToString(bytes);
            
            // Determine content type from object name extension
            String contentType = getContentTypeFromObjectName(objectName);
            
            // Return formatted base64 string
            return "data:" + contentType + ";base64," + base64;
            
        } catch (Exception e) {
            log.error("Error fetching image from MinIO for object: {}", objectName, e);
            return null; // Return null if image not found
        }
    }
    
    private String getContentTypeFromObjectName(String objectName) {
        String extension = objectName.substring(objectName.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg"; // Default fallback
        };
    }
}
```

### 19.3 Product Service Implementation

```java
package tz.go.tari.portal_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import tz.go.tari.portal_backend.client.ManageCatalogueServiceClient;
import tz.go.tari.portal_backend.dto.ProductDTO;
import tz.go.tari.portal_backend.kasha.services.MinioService;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ManageCatalogueServiceClient catalogueClient;
    private final MinioService minioService;
    
    @Override
    @Cacheable(value = "products", key = "#uid")
    public ProductDTO getProductByUid(String uid) {
        // Fetch from gateway service
        ProductResponseDTO response = catalogueClient.getProductByUid(uid);
        
        // Convert to DTO
        ProductDTO productDTO = convertToDTO(response);
        
        // Convert MinIO object name to base64
        if (response.getImageObjectName() != null) {
            String base64Image = minioService.getImageAsBase64(response.getImageObjectName());
            productDTO.setImageUrl(base64Image);
        }
        
        return productDTO;
    }
    
    private ProductDTO convertToDTO(ProductResponseDTO response) {
        // Conversion logic
        ProductDTO dto = new ProductDTO();
        dto.setId(response.getUid().toString());
        dto.setName(response.getName());
        dto.setDescription(response.getDescription());
        dto.setCategory(response.getCategory());
        // ... map other fields
        return dto;
    }
}
```

### 19.4 MinIO Configuration (Following Internal Project Pattern)

```java
package tz.go.tari.portal_backend.kasha.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {
    
    private String endpoint;
    private Integer port;
    private String accessKey;
    private String secretKey;
    private boolean secure;
    private String bucketName;
    
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .credentials(accessKey, secretKey)
                .endpoint(endpoint, port, secure)
                .build();
    }
}
```

---

## Document Version
- **Version**: 2.0
- **Date**: 2026-01-15
- **Author**: TARI Portal Development Team
- **Updated**: Added RDMS structure, MinIO base64 handling, Gateway service integration, Manage Catalogue Service details
