# VitalGuide API Documentation

Base URL: `https://api.vitalguide.life`

## Authentication

All endpoints require HTTP Basic Authentication.

```
Authorization: Basic <base64(username:password)>
```

Example header value for `admin:changeme`:
```
Authorization: Basic YWRtaW46Y2hhbmdlbWU=
```

---

## Products API

### Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Auto-generated unique identifier |
| `name` | string | Product name |
| `description` | string | Product description |
| `affiliate_link` | string | Affiliate URL |
| `image_url` | string | Product image URL |
| `categories` | string[] | List of category names |
| `article_ids` | string[] | IDs of related articles |
| `rating` | number | Average rating (e.g. 4.8) |
| `reviews` | number | Total review count |
| `best_rating` | number | Maximum possible rating (default: 5) |
| `worst_rating` | number | Minimum possible rating (default: 1) |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |

---

### List Products

```
GET /products
```

Returns a paginated list of products, with optional filtering.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Items per page (default: 20, max: 100) |
| `nextToken` | string | Pagination cursor from a previous response |
| `category` | string | Filter by category name |
| `article_id` | string | Filter by associated article ID |

**Response 200**

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Magnesium Glycinate",
      "description": "High-absorption magnesium supplement",
      "affiliate_link": "https://example.com/buy",
      "image_url": "https://cdn.example.com/products/mag.jpg",
      "categories": ["supplements", "sleep"],
      "article_ids": ["abc123"],
      "rating": 4.8,
      "reviews": 1200,
      "best_rating": 5,
      "worst_rating": 1,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "nextToken": null
}
```

---

### Create Product

```
POST /products
```

**Request Body**

```json
{
  "name": "Magnesium Glycinate",
  "description": "High-absorption magnesium supplement",
  "affiliate_link": "https://example.com/buy",
  "image_url": "https://cdn.example.com/products/mag.jpg",
  "categories": ["supplements", "sleep"],
  "article_ids": ["abc123"],
  "rating": 4.8,
  "reviews": 1200,
  "best_rating": 5,
  "worst_rating": 1
}
```

**Response 201**

Returns the created product object with a generated `id`, `createdAt`, and `updatedAt`.

---

### Get Product

```
GET /products/{id}
```

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Product UUID |

**Response 200** — Product object

**Response 404**

```json
{ "error": "Not found" }
```

---

### Update Product (Full Replace)

```
PUT /products/{id}
```

Replaces all fields on the product. Any omitted fields are reset to defaults.

**Request Body** — same shape as Create

**Response 200** — Updated product object

---

### Patch Product (Partial Update)

```
PATCH /products/{id}
```

Updates only the fields provided in the request body. All other fields are unchanged.

**Patchable fields**: `name`, `description`, `affiliate_link`, `image_url`, `categories`, `article_ids`, `rating`, `reviews`, `best_rating`, `worst_rating`

**Request Body** — any subset of the patchable fields

```json
{
  "rating": 4.9,
  "reviews": 1350
}
```

**Response 200** — Updated product object

---

### Delete Product

```
DELETE /products/{id}
```

**Response 204** — No content

---

## Articles API

### Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Auto-generated unique identifier |
| `title` | string | Article title |
| `sub_title` | string | Article subtitle |
| `summary` | string | Short summary |
| `body` | string | Full article body (HTML or Markdown) |
| `image_url` | string | Featured image URL |
| `categories` | string[] | List of category names |
| `date` | string | Publication date (e.g. `"2026-04-01"`) |
| `time_to_read_in_minutes` | number | Estimated read time |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |

---

### List Articles

```
GET /articles
```

Returns a paginated list of articles, with optional category filtering.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Items per page (default: 20, max: 100) |
| `nextToken` | string | Pagination cursor from a previous response |
| `category` | string | Filter by category name |

**Response 200**

```json
{
  "items": [
    {
      "id": "7d3c1e2a-9b4f-4e8d-a2c6-1f5e8b3d9a7c",
      "title": "Best Magnesium Supplements for Sleep",
      "sub_title": "A science-backed guide",
      "summary": "We reviewed 12 products to find the best magnesium for sleep.",
      "body": "<p>Magnesium is an essential mineral...</p>",
      "image_url": "https://cdn.example.com/articles/magnesium.jpg",
      "categories": ["supplements", "sleep"],
      "date": "2026-04-01",
      "time_to_read_in_minutes": 8,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "nextToken": null
}
```

---

### Create Article

```
POST /articles
```

**Request Body**

```json
{
  "title": "Best Magnesium Supplements for Sleep",
  "sub_title": "A science-backed guide",
  "summary": "We reviewed 12 products to find the best magnesium for sleep.",
  "body": "<p>Magnesium is an essential mineral...</p>",
  "image_url": "https://cdn.example.com/articles/magnesium.jpg",
  "categories": ["supplements", "sleep"],
  "date": "2026-04-01",
  "time_to_read_in_minutes": 8
}
```

**Response 201** — Created article object with generated `id`, `createdAt`, `updatedAt`

---

### Get Article

```
GET /articles/{id}
```

**Response 200** — Article object

**Response 404**

```json
{ "error": "Not found" }
```

---

### Update Article (Full Replace)

```
PUT /articles/{id}
```

Replaces all fields. Omitted fields reset to defaults.

**Request Body** — same shape as Create

**Response 200** — Updated article object

---

### Patch Article (Partial Update)

```
PATCH /articles/{id}
```

**Patchable fields**: `title`, `sub_title`, `summary`, `body`, `image_url`, `categories`, `date`, `time_to_read_in_minutes`

**Request Body** — any subset of patchable fields

**Response 200** — Updated article object

---

### Delete Article

```
DELETE /articles/{id}
```

**Response 204** — No content

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad request — missing or invalid parameters |
| 401 | Unauthorized — missing or invalid Basic Auth credentials |
| 404 | Not found — resource does not exist |

**Example 401**

```json
{ "error": "Unauthorized" }
```

**Example 400**

```json
{ "error": "Invalid JSON" }
```

---

## CORS

All endpoints support CORS with `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: *`.
