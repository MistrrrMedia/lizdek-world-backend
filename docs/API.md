# Lizdek World Backend API Documentation

## Overview

The Lizdek World Backend API provides RESTful endpoints for managing music releases, shows, and administrative functions. The API is built with Express.js and uses JWT authentication for admin operations.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.lizdek.world/api
```

## CORS Configuration

- **Development**: `http://localhost:5173`, `http://localhost:3000`
- **Production**: `https://lizdek.world`, `https://www.lizdek.world`, `https://api.lizdek.world`
- **Credentials**: Enabled for authenticated requests

## Authentication

### JWT Token Authentication

Admin endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Format

- **Type**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Payload**: `{ id, username, role }`
- **Database Verification**: Tokens are verified against database user records

## Response Format

### Success Response
```json
{
  "id": 1,
  "title": "Example Release",
  "venue": "Example Venue",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Validation Error Response
```json
{
  "error": "Validation Error",
  "message": "Title is required and must be a non-empty string"
}
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP (successful requests not counted)
- **Rate limit headers**: `RateLimit-*` headers included in responses
- **Test environment**: Rate limiting disabled for testing

## Health Check

### GET /api/health

Returns the health status of the API and database.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "environment": "development"
}
```

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "disconnected",
  "environment": "development",
  "error": "Database connection failed"
}
```

**Status Codes:**
- `200` - API is healthy
- `503` - API is unhealthy (database disconnected)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | `development` |
| `PORT` | Server port | No | `3001` |
| `DB_HOST` | Database host | Yes | - |
| `DB_PORT` | Database port | No | `3306` |
| `DB_USER` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `VITE_APP_VERSION` | Application version | No | `1.0.0` |

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Admin access required |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Duplicate resource |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Logging

The API logs all requests and errors to:
- **File**: `logs/app.log` (JSON format)
- **Console**: Development environment only

### Log Format

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "GET /api/shows - 200",
  "data": {
    "method": "GET",
    "url": "/api/shows",
    "status": 200,
    "duration": "45ms",
    "ip": "127.0.0.1"
  }
}
``` 