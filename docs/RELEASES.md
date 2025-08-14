# Releases API Documentation

## Overview

Releases endpoints for managing music releases and their streaming links. Public endpoints are accessible without authentication, while admin endpoints require JWT authentication.

## Public Endpoints

### GET /api/releases

Retrieve all releases ordered by release date.

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "title": "New Album",
    "url_title": "new-album",
    "soundcloud_url": "https://soundcloud.com/artist/new-album",
    "collaborators": "Featured Artist",
    "release_date": "2024-01-01",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/releases/:urlTitle

Retrieve a specific release by URL title.

**Parameters:**
- `urlTitle` (path): URL-friendly title (e.g., "new-album")

**Response (Success - 200):**
```json
{
  "id": 1,
  "title": "New Album",
  "url_title": "new-album",
  "soundcloud_url": "https://soundcloud.com/artist/new-album",
  "collaborators": "Featured Artist",
  "release_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "links": [
    {
      "id": 1,
      "release_id": 1,
      "platform": "spotify",
      "url": "https://open.spotify.com/track/example"
    },
    {
      "id": 2,
      "release_id": 1,
      "platform": "apple_music",
      "url": "https://music.apple.com/track/example"
    }
  ]
}
```

**Response (Error - 404):**
```json
{
  "error": "Release not found"
}
```

## Admin Endpoints

### POST /api/releases

Create a new release (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Album",
  "url_title": "new-album",
  "soundcloud_url": "https://soundcloud.com/artist/new-album",
  "collaborators": "Featured Artist",
  "release_date": "2024-01-01",
  "links": [
    {
      "platform": "spotify",
      "url": "https://open.spotify.com/track/example"
    },
    {
      "platform": "apple_music",
      "url": "https://music.apple.com/track/example"
    }
  ]
}
```

**Validation Rules:**
- `title`: Required, string, max 200 characters
- `url_title`: Required, string, lowercase letters/numbers/hyphens only
- `soundcloud_url`: Required, string, must contain 'soundcloud.com'
- `release_date`: Required, valid date format (YYYY-MM-DD)
- `collaborators`: Optional, string
- `links`: Optional, array of link objects

**Link Validation Rules:**
- `platform`: Required, one of: 'spotify', 'soundcloud', 'apple_music', 'youtube'
- `url`: Required, string, max 500 characters

**Response (Success - 201):**
```json
{
  "id": 1,
  "title": "New Album",
  "url_title": "new-album",
  "soundcloud_url": "https://soundcloud.com/artist/new-album",
  "collaborators": "Featured Artist",
  "release_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "links": [
    {
      "id": 1,
      "release_id": 1,
      "platform": "spotify",
      "url": "https://open.spotify.com/track/example"
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "error": "Title is required and must be a non-empty string"
}
```

**Response (Error - 409):**
```json
{
  "error": "A release with this title already exists"
}
```

### PUT /api/releases/:id

Update an existing release (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): Release ID

**Request Body:** Same as POST

**Validation Rules:** Same as POST

**Response (Success - 200):**
```json
{
  "id": 1,
  "title": "Updated Album",
  "url_title": "updated-album",
  "soundcloud_url": "https://soundcloud.com/artist/updated-album",
  "collaborators": "Updated Artist",
  "release_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "links": [
    {
      "id": 1,
      "release_id": 1,
      "platform": "spotify",
      "url": "https://open.spotify.com/track/updated"
    }
  ]
}
```

**Response (Error - 404):**
```json
{
  "error": "Release not found"
}
```

### DELETE /api/releases/:id

Delete a release (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Parameters:**
- `id` (path): Release ID

**Response (Success - 200):**
```json
{
  "message": "Release deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "error": "Release not found"
}
```

## Data Models

### Release Object
```typescript
interface Release {
  id: number;
  title: string;
  url_title: string;
  soundcloud_url: string;
  collaborators?: string;
  release_date: string;
  created_at: string;
  updated_at: string;
  links?: ReleaseLink[];
}
```

### Release Link Object
```typescript
interface ReleaseLink {
  id: number;
  release_id: number;
  platform: 'spotify' | 'soundcloud' | 'apple_music' | 'youtube';
  url: string;
}
```

### Create Release Data
```typescript
interface CreateReleaseData {
  title: string;
  url_title: string;
  soundcloud_url: string;
  collaborators?: string;
  release_date: string;
  links?: {
    platform: string;
    url: string;
  }[];
}
```

## Database Schema

### Releases Table
```sql
CREATE TABLE releases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  url_title VARCHAR(200) UNIQUE NOT NULL,
  soundcloud_url VARCHAR(500) NOT NULL,
  collaborators TEXT,
  release_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Release Links Table
```sql
CREATE TABLE release_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  release_id INT NOT NULL,
  platform ENUM('spotify', 'soundcloud', 'apple_music', 'youtube', 'free_download') NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
);
```

## Examples

### Create a New Release

```javascript
const releaseData = {
  title: "New Album",
  url_title: "new-album",
  soundcloud_url: "https://soundcloud.com/artist/new-album",
  collaborators: "Featured Artist",
  release_date: "2024-01-01",
  links: [
    {
      platform: "spotify",
      url: "https://open.spotify.com/track/example"
    },
    {
      platform: "apple_music",
      url: "https://music.apple.com/track/example"
    }
  ]
};

const response = await fetch('/api/releases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(releaseData)
});

const release = await response.json();
```

### Get All Releases

```javascript
const response = await fetch('/api/releases');
const releases = await response.json();

releases.forEach(release => {
  console.log(`${release.title} - ${release.release_date}`);
});
```

### Get Specific Release

```javascript
const response = await fetch('/api/releases/new-album');
const release = await response.json();

console.log(`Title: ${release.title}`);
console.log(`Release Date: ${release.release_date}`);
console.log(`SoundCloud: ${release.soundcloud_url}`);

if (release.links) {
  release.links.forEach(link => {
    console.log(`${link.platform}: ${link.url}`);
  });
}
```

### Update a Release

```javascript
const updateData = {
  title: "Updated Album Title",
  url_title: "updated-album",
  soundcloud_url: "https://soundcloud.com/artist/updated-album",
  collaborators: "New Featured Artist",
  release_date: "2024-01-01",
  links: [
    {
      platform: "spotify",
      url: "https://open.spotify.com/track/updated"
    }
  ]
};

const response = await fetch('/api/releases/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});

const updatedRelease = await response.json();
```

## Error Handling

### Common Validation Errors

1. **Missing Required Fields**
   ```json
   {
     "error": "Title is required and must be a non-empty string"
   }
   ```

2. **Invalid URL Title Format**
   ```json
   {
     "error": "URL title must contain only lowercase letters, numbers, and hyphens"
   }
   ```

3. **Invalid SoundCloud URL**
   ```json
   {
     "error": "SoundCloud URL is required and must be a valid SoundCloud URL"
   }
   ```

4. **Duplicate Title**
   ```json
   {
     "error": "A release with this title already exists"
   }
   ```

5. **Duplicate URL Title**
   ```json
   {
     "error": "A release with this URL title already exists"
   }
   ```

6. **Invalid Link Platform**
   ```json
   {
     "error": "Invalid platform: invalid_platform. Must be one of: spotify, soundcloud, apple_music, youtube"
   }
   ```

## Testing

### Test Cases
- ✅ GET all releases
- ✅ GET specific release by URL title
- ✅ POST create release (validation)
- ✅ PUT update release (validation)
- ✅ DELETE release
- ✅ Authentication required for admin endpoints
- ✅ Input validation for all fields
- ✅ Duplicate title/URL title prevention
- ✅ Link validation

### Test Commands
```bash
# Run releases tests only
npm test -- --grep "Releases Endpoints"

# Run specific test
npm test -- --grep "should return 200 and array of releases"
``` 