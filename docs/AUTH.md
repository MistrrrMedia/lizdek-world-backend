# Authentication API Documentation

## Overview

Authentication endpoints for admin access to the Lizdek World Backend API. All endpoints use JWT tokens for secure authentication.

## Endpoints

### POST /api/auth/login

Authenticate admin user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Validation Rules:**
- `username`: Required, string, max 50 characters
- `password`: Required, string, min 6 characters

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Username is required and must be a non-empty string"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

**Response (Error - 429):**
```json
{
  "error": "Too many authentication attempts, please try again later.",
  "retryAfter": "15 minutes"
}
```

### GET /api/auth/verify

Verify JWT token and return user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "No token provided"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid token"
}
```

**Response (Error - 401):**
```json
{
  "error": "Token expired"
}
```

## Authentication Flow

### 1. Login Process

```javascript
// 1. Send login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'your_admin_username',
    password: 'your_admin_password'
  })
});

// 2. Store token
const { token, user } = await response.json();
sessionStorage.setItem('auth_token', token);
```

### 2. Using Token for Protected Endpoints

```javascript
// Include token in Authorization header
const response = await fetch('/api/shows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(showData)
});
```

### 3. Token Verification

```javascript
// Verify token is still valid
const response = await fetch('/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.status === 401) {
  // Token is invalid, redirect to login
  sessionStorage.removeItem('auth_token');
  window.location.href = '/admin/login';
}
```

## Security Features

### Rate Limiting
- **Login attempts**: 5 requests per 15 minutes per IP
- **Verify attempts**: 5 requests per 15 minutes per IP
- **Successful requests**: Not counted against rate limit

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Minimum length**: 6 characters
- **Storage**: Hashed passwords only

### Token Security
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Secret**: Environment variable `JWT_SECRET`
- **Payload**: User ID, username, and role

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials**
   - Check username/password combination
   - Verify user exists in database

2. **Token Expired**
   - Token has exceeded 24-hour limit
   - Re-authenticate to get new token

3. **Rate Limited**
   - Too many authentication attempts
   - Wait 15 minutes before retrying

4. **Missing Token**
   - Authorization header not provided
   - Include `Bearer <token>` in headers

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

### Test Cases
- ✅ Missing username/password
- ✅ Empty username/password
- ✅ Username too long (>50 chars)
- ✅ Password too short (<6 chars)
- ✅ Invalid credentials
- ✅ Missing token
- ✅ Invalid token format
- ✅ Expired token

### Test Commands
```bash
# Run auth tests only
npm test -- --grep "Auth Endpoints"

# Run specific test
npm test -- --grep "should return 400 for missing username"
``` 