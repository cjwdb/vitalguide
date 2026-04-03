# VitalGuide Articles API

**Base URL:** `https://api.vitalguide.life/articles`

> All endpoints require HTTP Basic Authentication.
> Set the `Authorization` header: `Authorization: Basic <base64(username:password)>`

---

## Article Object

```json
{
  "id": "uuid",
  "title": "string",
  "sub_title": "string",
  "summary": "string",
  "body": "string",
  "image_url": "string",
  "categories": ["string"],
  "date": "string",
  "time_to_read_in_minutes": 11,
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

---

## Endpoints

### POST /articles
Create a new article.

**Request body:**
```json
{
  "title": "string",
  "sub_title": "string",
  "summary": "string",
  "body": "string",
  "image_url": "string",
  "categories": ["string"],
  "date": "string",
  "time_to_read_in_minutes": 11
}
```

**Response:** `201 Created` — returns the created article object (id is auto-generated UUID).

---

### GET /articles/{id}
Retrieve an article by ID.

**Response:** `200 OK` — returns the article object.
**Error:** `404 Not Found` if the article does not exist.

---

### PUT /articles/{id}
Full replacement update. All fields are overwritten (unset fields default to empty/zero).

**Request body:** same shape as POST.

**Response:** `200 OK` — returns the updated article object.
**Error:** `404 Not Found` if the article does not exist.

---

### PATCH /articles/{id}
Partial update. Only the fields included in the request body are updated.

**Patchable fields:** `title`, `sub_title`, `summary`, `body`, `image_url`, `categories`, `date`, `time_to_read_in_minutes`

**Request body (any subset of fields):**
```json
{
  "title": "Updated Title",
  "categories": ["fitness", "wellness"]
}
```

**Response:** `200 OK` — returns the full updated article object.
**Error:** `400 Bad Request` if no valid fields are provided, `404 Not Found` if the article does not exist.

---

### DELETE /articles/{id}
Delete an article by ID.

**Response:** `204 No Content`
**Error:** `404 Not Found` if the article does not exist.

---

### GET /articles
List articles with pagination and optional category filtering.

**Query parameters:**

| Parameter   | Type   | Default | Description                                      |
|-------------|--------|---------|--------------------------------------------------|
| `limit`     | number | 20      | Max items per page (maximum: 100)                |
| `nextToken` | string | —       | Pagination cursor from previous response         |
| `category`  | string | —       | Filter articles that contain this category value |

**Response:** `200 OK`
```json
{
  "items": [...],
  "count": 20,
  "nextToken": "base64-encoded-cursor-or-null"
}
```

To fetch the next page, pass the `nextToken` value from the response as a query parameter.

---

## Authentication Errors

| Status | Description                              |
|--------|------------------------------------------|
| `401`  | Missing or invalid Basic Auth credentials |

---

## AWS Resources

- **DynamoDB table:** `vitalguide_articles` (us-east-1)
- **API Gateway (direct):** `https://2lj6fmxqm3.execute-api.us-east-1.amazonaws.com/prod/articles`
- **Custom domain:** `https://api.vitalguide.life/articles` *(pending DNS/ACM setup)*
