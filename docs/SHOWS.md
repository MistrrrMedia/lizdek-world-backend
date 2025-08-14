# Shows API Documentation

## Overview

Shows endpoints for managing live performances and events. Public endpoints are accessible without authentication, while admin endpoints require JWT authentication.

## Public Endpoints

### GET /api/shows

Retrieve all shows ordered by date.

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "venue": "The Grand Hall",
    "city": "New York",
    "state_province": "NY",
    "country": "USA",
    "ticket_link": "https://tickets.example.com/show1",
    "show_date": "2024-12-31",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/shows/upcoming

Retrieve upcoming shows and count.

**Response (Success - 200):**
```json
{
  "shows": [
    {
      "id": 1,
      "venue": "The Grand Hall",
      "city": "New York",
      "state_province": "NY",
      "country": "USA",
      "ticket_link": "https://tickets.example.com/show1",
      "show_date": "2024-12-31",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "hasUpcomingShows": true
}
```

### GET /api/shows/:id

Retrieve a specific show by ID.

**Parameters:**
- `id` (path): Show ID

**Response (Success - 200):**
```json
{
  "id": 1,
  "venue": "The Grand Hall",
  "city": "New York",
  "state_province": "NY",
  "country": "USA",
  "ticket_link": "https://tickets.example.com/show1",
  "show_date": "2024-12-31",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Response (Error - 404):**
```json
{
  "error": "Show not found"
}
```

## Admin Endpoints

### POST /api/shows

Create a new show (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "venue": "The Grand Hall",
  "city": "New York",
  "state_province": "NY",
  "country": "USA",
  "ticket_link": "https://tickets.example.com/show1",
  "show_date": "2024-12-31"
}
```

**Validation Rules:**
- `venue`: Required, string, max 200 characters
- `city`: Required, string, max 100 characters
- `state_province`: Required, string, max 100 characters
- `country`: Required, string, max 100 characters
- `show_date`: Required, valid date format (YYYY-MM-DD)
- `ticket_link`: Optional, string, max 500 characters

**Response (Success - 201):**
```json
{
  "id": 1,
  "venue": "The Grand Hall",
  "city": "New York",
  "state_province": "NY",
  "country": "USA",
  "ticket_link": "https://tickets.example.com/show1",
  "show_date": "2024-12-31",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "error": "Venue is required and must be a non-empty string"
}
```

**Response (Error - 401):**
```json
{
  "error": "Access token required"
}
```

**Response (Error - 403):**
```json
{
  "error": "Admin access required"
}
```

### PUT /api/shows/:id

Update an existing show (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Show ID

**Request Body:**
```json
{
  "venue": "Updated Venue",
  "city": "Updated City",
  "state_province": "CA",
  "country": "USA",
  "ticket_link": "https://tickets.example.com/updated",
  "show_date": "2024-12-31"
}
```

**Validation Rules:** Same as POST

**Response (Success - 200):**
```json
{
  "id": 1,
  "venue": "Updated Venue",
  "city": "Updated City",
  "state_province": "CA",
  "country": "USA",
  "ticket_link": "https://tickets.example.com/updated",
  "show_date": "2024-12-31",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Response (Error - 404):**
```json
{
  "error": "Show not found"
}
```

### DELETE /api/shows/:id

Delete a show (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Parameters:**
- `id` (path): Show ID

**Response (Success - 200):**
```json
{
  "message": "Show deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "error": "Show not found"
}
```

## Data Models

### Show Object
```typescript
interface Show {
  id: number;
  venue: string;
  city: string;
  state_province: string;
  country: string;
  ticket_link?: string;
  show_date: string;
  created_at: string;
  updated_at: string;
}
```

### Create Show Data
```typescript
interface CreateShowData {
  venue: string;
  city: string;
  state_province: string;
  country: string;
  ticket_link?: string;
  show_date: string;
}
```

## Database Schema

### Shows Table
```sql
CREATE TABLE shows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venue VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  ticket_link VARCHAR(500),
  show_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Examples

### Create a New Show

```javascript
const showData = {
  venue: "The Grand Hall",
  city: "New York",
  state_province: "NY",
  country: "USA",
  ticket_link: "https://tickets.example.com/show1",
  show_date: "2024-12-31"
};

const response = await fetch('/api/shows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(showData)
});

const show = await response.json();
```

### Get Upcoming Shows

```javascript
const response = await fetch('/api/shows/upcoming');
const { shows, count, hasUpcomingShows } = await response.json();

if (hasUpcomingShows) {
  console.log(`Found ${count} upcoming shows`);
  shows.forEach(show => {
    console.log(`${show.venue} - ${show.city}, ${show.state_province}`);
  });
}
```

### Update a Show

```javascript
const updateData = {
  venue: "Updated Venue Name",
  city: "Los Angeles",
  state_province: "CA",
  country: "USA",
  show_date: "2024-12-31"
};

const response = await fetch('/api/shows/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});

const updatedShow = await response.json();
```

## Error Handling

### Common Validation Errors

1. **Missing Required Fields**
   ```json
   {
     "error": "Venue is required and must be a non-empty string"
   }
   ```

2. **Invalid Date Format**
   ```json
   {
     "error": "Show date is required and must be a valid date"
   }
   ```

3. **Field Too Long**
   ```json
   {
     "error": "Venue must be 200 characters or less"
   }
   ```

4. **Show Not Found**
   ```json
   {
     "error": "Show not found"
   }
   ```

## Testing

### Test Cases
- ✅ GET all shows
- ✅ GET upcoming shows
- ✅ GET specific show
- ✅ POST create show (validation)
- ✅ PUT update show (validation)
- ✅ DELETE show
- ✅ Authentication required for admin endpoints
- ✅ Input validation for all fields

### Test Commands
```bash
# Run shows tests only
npm test -- --grep "Shows Endpoints"

# Run specific test
npm test -- --grep "should return 200 and array of shows"
``` 