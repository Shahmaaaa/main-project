# Block-Aid API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Rate Limiting
- General: 200 requests per day per IP
- Strict: 50 requests per hour for sensitive operations

## Endpoints

### Health Check

#### Get System Status
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-14T10:30:00.000Z",
  "blockchain_connected": true
}
```

### Disaster Events

#### Create New Disaster Event
```http
POST /events/create
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Parameters:**
- `disaster_type` (string, required): Type of disaster (flood, earthquake, cyclone, landslide)
- `location` (string, required): Affected location name
- `image` (file, required): Disaster image (JPEG/PNG)
- `rainfall_mm` (number, optional): Rainfall intensity in mm
- `water_level_cm` (number, optional): Water level in cm
- `population_affected` (number, optional): Estimated affected population
- `infrastructure_damage` (number, optional): Infrastructure damage percentage (0-100)
- `impact_area` (number, optional): Affected area in sq km

**Response (201):**
```json
{
  "id": 1,
  "severity_score": 68.5,
  "severity_level": "MEDIUM",
  "confidence": 0.85,
  "component_scores": {
    "image_analysis": 72.0,
    "rainfall_intensity": 65.0,
    "water_level": 70.0,
    "population_affected": 62.0,
    "infrastructure_damage": 65.0,
    "impact_area": 68.0
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: Duplicate disaster event detected
- `503`: AI model not available
- `500`: Internal server error

#### List All Disaster Events
```http
GET /events?page=1&per_page=10
```

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `per_page` (integer, default: 10): Events per page (max 100)

**Response (200):**
```json
{
  "total": 25,
  "pages": 3,
  "current_page": 1,
  "events": [
    {
      "id": 1,
      "event_id": 1,
      "disaster_type": "flood",
      "location": "Riverside City",
      "severity_score": 68.5,
      "severity_level": "MEDIUM",
      "ai_predictions": {
        "low": 0.15,
        "medium": 0.70,
        "high": 0.15
      },
      "is_verified": false,
      "created_at": "2026-01-14T10:30:00Z",
      "updated_at": "2026-01-14T10:30:00Z"
    }
  ]
}
```

#### Get Event Details
```http
GET /events/:event_id
```

**Parameters:**
- `event_id` (integer): Event ID

**Response (200):**
```json
{
  "id": 1,
  "event_id": 1,
  "disaster_type": "flood",
  "location": "Riverside City",
  "severity_score": 68.5,
  "severity_level": "MEDIUM",
  "ai_predictions": {
    "low": 0.15,
    "medium": 0.70,
    "high": 0.15
  },
  "is_verified": false,
  "created_at": "2026-01-14T10:30:00Z",
  "updated_at": "2026-01-14T10:30:00Z"
}
```

#### Verify Disaster Event
```http
POST /events/:event_id/verify
Authorization: Bearer <token>
```

**Required Role:** official, admin

**Parameters:**
- `event_id` (integer): Event ID to verify

**Response (200):**
```json
{
  "message": "Event verified successfully",
  "event": {
    "id": 1,
    "is_verified": true,
    ...
  }
}
```

**Error Responses:**
- `404`: Event not found
- `400`: Event already verified
- `401`: Unauthorized

### Disaster Funds

#### Create Fund Pool
```http
POST /funds/create
Content-Type: application/json
Authorization: Bearer <token>
```

**Required Role:** official, admin

**Body:**
```json
{
  "event_id": 1,
  "amount": 100000
}
```

**Response (201):**
```json
{
  "id": 1,
  "fund": {
    "id": 1,
    "fund_id": 1,
    "event_id": 1,
    "total_amount": 100000,
    "distributed_amount": 0,
    "status": "APPROVED",
    "created_at": "2026-01-14T10:30:00Z",
    "updated_at": "2026-01-14T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `404`: Event not found
- `400`: Event not verified

#### Get Fund Details
```http
GET /funds/:fund_id
```

**Parameters:**
- `fund_id` (integer): Fund ID

**Response (200):**
```json
{
  "id": 1,
  "fund_id": 1,
  "event_id": 1,
  "total_amount": 100000,
  "distributed_amount": 0,
  "status": "APPROVED",
  "created_at": "2026-01-14T10:30:00Z",
  "updated_at": "2026-01-14T10:30:00Z"
}
```

#### Distribute Fund
```http
POST /funds/:fund_id/distribute
Content-Type: application/json
Authorization: Bearer <token>
```

**Required Role:** official, admin

**Body:**
```json
{
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e3",
  "amount": 10000,
  "description": "Relief supplies distribution"
}
```

**Response (200):**
```json
{
  "message": "Fund distributed successfully",
  "transaction": {
    "fund_id": 1,
    "amount": 10000,
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e3",
    "timestamp": "2026-01-14T10:30:00Z"
  }
}
```

**Error Responses:**
- `400`: Insufficient fund balance
- `404`: Fund not found
- `429`: Fund distribution rate limited

### Audit Logs

#### Get Audit Trail
```http
GET /audit-logs?page=1&per_page=20
Authorization: Bearer <token>
```

**Required Role:** official, admin

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `per_page` (integer, default: 20): Logs per page

**Response (200):**
```json
{
  "total": 150,
  "logs": [
    {
      "id": 1,
      "action": "CREATE_EVENT",
      "entity_type": "DisasterEvent",
      "entity_id": 1,
      "user": "admin@blockaid.local",
      "timestamp": "2026-01-14T10:30:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Example Workflows

### Complete Disaster Relief Workflow

1. **Create Event with AI Analysis:**
```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Authorization: Bearer eyJ..." \
  -F "disaster_type=flood" \
  -F "location=Riverside" \
  -F "image=@disaster.jpg" \
  -F "rainfall_mm=150" \
  -F "water_level_cm=100" \
  -F "population_affected=10000" \
  -F "infrastructure_damage=75" \
  -F "impact_area=50"
```

2. **Verify Event:**
```bash
curl -X POST http://localhost:5000/api/events/1/verify \
  -H "Authorization: Bearer eyJ..."
```

3. **Create Fund Pool:**
```bash
curl -X POST http://localhost:5000/api/funds/create \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "amount": 500000
  }'
```

4. **Distribute Fund:**
```bash
curl -X POST http://localhost:5000/api/funds/1/distribute \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f42e3",
    "amount": 100000
  }'
```

5. **View Audit Log:**
```bash
curl -X GET http://localhost:5000/api/audit-logs?page=1 \
  -H "Authorization: Bearer eyJ..."
```

## Rate Limiting Headers

Every response includes rate limit information:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1642176000
```

## Pagination

List endpoints support pagination with these parameters:
- `page`: 1-indexed page number (default: 1)
- `per_page`: Items per page (default: 10, max: 100)

Response includes:
- `total`: Total number of items
- `pages`: Total number of pages
- `current_page`: Current page number
- Items array

---

For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
