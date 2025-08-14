# API Examples and Integration Guide

## Overview

This document provides practical examples and integration patterns for the Lizdek World Backend API.

## Quick Start

### 1. Authentication

```javascript
// Login and get token
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'your_admin_username',
    password: 'your_admin_password'
  })
});

const { token, user } = await loginResponse.json();
console.log('Authenticated as:', user.username);
```

### 2. Using the Token

```javascript
// Store token for future requests
sessionStorage.setItem('auth_token', token);

// Use token in requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

## Complete Examples

### Shows Management

#### Get All Shows
```javascript
const response = await fetch('http://localhost:3001/api/shows');
const shows = await response.json();

shows.forEach(show => {
  console.log(`${show.venue} - ${show.city}, ${show.state_province}`);
});
```

#### Get Upcoming Shows
```javascript
const response = await fetch('http://localhost:3001/api/shows/upcoming');
const { shows, count, hasUpcomingShows } = await response.json();

if (hasUpcomingShows) {
  console.log(`Found ${count} upcoming shows`);
  shows.forEach(show => {
    console.log(`${show.venue} on ${show.show_date}`);
  });
}
```

#### Create a Show
```javascript
const showData = {
  venue: "The Grand Hall",
  city: "New York",
  state_province: "NY",
  country: "USA",
  ticket_link: "https://tickets.example.com/show1",
  show_date: "2024-12-31"
};

const response = await fetch('http://localhost:3001/api/shows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(showData)
});

if (response.ok) {
  const show = await response.json();
  console.log('Created show:', show.venue);
} else {
  const error = await response.json();
  console.error('Error:', error.message);
}
```

#### Update a Show
```javascript
const updateData = {
  venue: "Updated Venue Name",
  city: "Los Angeles",
  state_province: "CA",
  country: "USA",
  show_date: "2024-12-31"
};

const response = await fetch('http://localhost:3001/api/shows/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});

const updatedShow = await response.json();
console.log('Updated show:', updatedShow.venue);
```

#### Delete a Show
```javascript
const response = await fetch('http://localhost:3001/api/shows/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  console.log('Show deleted successfully');
}
```

### Releases Management

#### Get All Releases
```javascript
const response = await fetch('http://localhost:3001/api/releases');
const releases = await response.json();

releases.forEach(release => {
  console.log(`${release.title} - ${release.release_date}`);
});
```

#### Get Specific Release
```javascript
const response = await fetch('http://localhost:3001/api/releases/new-album');
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

#### Create a Release
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

const response = await fetch('http://localhost:3001/api/releases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(releaseData)
});

const release = await response.json();
console.log('Created release:', release.title);
```

#### Update a Release
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

const response = await fetch('http://localhost:3001/api/releases/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});

const updatedRelease = await response.json();
console.log('Updated release:', updatedRelease.title);
```

## Error Handling Examples

### Handle Validation Errors
```javascript
try {
  const response = await fetch('/api/shows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      // Missing required fields
      venue: "",
      city: "New York"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Validation error:', error.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Handle Authentication Errors
```javascript
const response = await fetch('/api/shows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // Missing Authorization header
  },
  body: JSON.stringify(showData)
});

if (response.status === 401) {
  console.error('Authentication required');
  // Redirect to login
  window.location.href = '/admin/login';
}
```

### Handle Rate Limiting
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(credentials)
});

if (response.status === 429) {
  const error = await response.json();
  console.error('Rate limited:', error.message);
  console.log('Retry after:', error.retryAfter);
}
```

## Frontend Integration

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useShows = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch('/api/shows');
        if (!response.ok) {
          throw new Error('Failed to fetch shows');
        }
        const data = await response.json();
        setShows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  return { shows, loading, error };
};
```

### Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Testing Examples

### Test API Endpoints
```javascript
// Using fetch in tests
describe('Shows API', () => {
  it('should create a show', async () => {
    const showData = {
      venue: "Test Venue",
      city: "Test City",
      state_province: "CA",
      country: "USA",
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

    expect(response.status).toBe(201);
    const show = await response.json();
    expect(show.venue).toBe("Test Venue");
  });
});
```

## Environment Setup

### Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev

# Run tests
npm test
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Common Patterns

### Pagination (Future Enhancement)
```javascript
// GET /api/shows?page=1&limit=10
const response = await fetch('/api/shows?page=1&limit=10');
const { shows, pagination } = await response.json();
```

### Search (Future Enhancement)
```javascript
// GET /api/shows?search=venue
const response = await fetch('/api/shows?search=venue');
const shows = await response.json();
```

### Filtering (Future Enhancement)
```javascript
// GET /api/shows?city=New York&date=2024-12-31
const response = await fetch('/api/shows?city=New York&date=2024-12-31');
const shows = await response.json();
``` 