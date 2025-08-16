# Lizdek World Backend

Express.js API backend for the Lizdek World music platform, providing authentication, content management, and data services for the frontend application.

## Features

### Core Services
- **Authentication**: JWT-based user authentication and session management
- **Release Management**: CRUD operations for music releases with metadata and link management
- **Show Management**: CRUD operations for live performances with ticket link support
- **Database Integration**: MySQL connection pooling and optimization
- **Docker Support**: Containerized deployment with production and development configurations

### Security & Performance
- **Helmet**: Security headers and middleware
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request throttling with IP-based limits
- **Input Validation**: Manual request validation and sanitization
- **Error Handling**: Comprehensive error management with custom error types

## Technology Stack

- **Node.js 18+**: Runtime environment
- **Express.js 4.21.2**: Web framework
- **MySQL2 3.14.3**: Database driver
- **JWT 9.0.2**: Authentication tokens
- **Bcryptjs 3.0.2**: Password hashing
- **Helmet 8.1.0**: Security middleware
- **CORS 2.8.5**: Cross-origin handling
- **Express Rate Limit 8.0.1**: API rate limiting

## Project Structure

```
lizdek-world-backend/
├── config/             # Database and configuration
├── middleware/          # Custom middleware (auth, validation)
├── routes/             # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── releases.js     # Release management
│   └── shows.js        # Show management
├── services/           # Business logic and external services
├── Dockerfile          # Development Docker configuration
├── Dockerfile.prod     # Production Docker configuration
├── render.yaml         # Render deployment configuration
├── server.js           # Application entry point
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database server
- Environment variables configured

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lizdek-world-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create environment file
   touch .env
   ```
   
   Add the following configuration to `.env`:
   ```bash
   # Database configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=lizdek_world
   
   # Application configuration
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=your_jwt_secret_key
   
   # CORS configuration (handled automatically based on environment)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API server will be available at `http://localhost:3001`

## Development

### Available Scripts

- **`npm start`**: Start production server
- **`npm run dev`**: Start development server with nodemon
- **`npm test`**: Run test suite (if configured)

### Docker Development

```bash
# Build and run with Docker
docker build -f Dockerfile -t lizdek-backend .
docker run -p 3001:3001 --env-file .env lizdek-backend
```

## API Integration

The backend provides RESTful API endpoints for the frontend application:

### Authentication Endpoints
- **`POST /api/auth/login`**: Admin authentication
- **`POST /api/auth/logout`**: Session termination
- **`GET /api/auth/verify`**: Token validation

### Content Management
- **`GET /api/releases`**: Retrieve all releases
- **`POST /api/releases`**: Create new release
- **`PUT /api/releases/:id`**: Update release
- **`DELETE /api/releases/:id`**: Remove release
- **`GET /api/shows`**: Retrieve all shows
- **`POST /api/shows`**: Create new show

### System Endpoints
- **`GET /api/health`**: Health check and status

## Docker Deployment

### Production (Render)

The project includes optimized Docker configurations for production deployment:

- **Dockerfile.prod**: Multi-stage build with security optimizations
- **Dockerfile**: Simple build for development/testing

### Local Production Build

```bash
# Build optimized production image
docker build -f Dockerfile.prod -t lizdek-backend:prod .
docker run -p 3001:3001 --env-file .env.prod lizdek-backend:prod
```

### Docker Features

- **Security**: Non-root user in production builds
- **Optimization**: Multi-stage builds reduce image size
- **Health Checks**: Built-in health monitoring
- **Environment**: Dynamic port configuration

## Environment Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | Yes |
| `PORT` | Server port | `3001` | No |
| `DB_HOST` | Database host | - | Yes |
| `DB_PORT` | Database port | `3306` | No |
| `DB_USER` | Database username | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |

## Database Schema

### Releases Table
- `id` (Primary Key)
- `title` (VARCHAR)
- `artist` (VARCHAR)
- `release_date` (DATE)
- `cover_art_url` (VARCHAR)
- `streaming_links` (JSON)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Shows Table
- `id` (Primary Key)
- `title` (VARCHAR)
- `venue` (VARCHAR)
- `date` (DATETIME)
- `ticket_url` (VARCHAR)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin restrictions
- **Input Validation**: Request sanitization and validation
- **SQL Injection Prevention**: Parameterized queries
- **Security Headers**: Helmet middleware for HTTP headers

## Error Handling

The application implements comprehensive error handling:

- **Database Errors**: Connection and query error management
- **Validation Errors**: Input validation and sanitization
- **Authentication Errors**: JWT token validation and expiration
- **File Upload Errors**: Multer error handling and validation
- **General Errors**: 500-level error responses with logging

## Deployment

### Render (Recommended)

1. Connect your GitHub repository to Render
2. Configure environment variables in Render dashboard
3. Deploy automatically using `Dockerfile.prod`

### Other Platforms

The Docker setup works with any container platform:
- **AWS ECS**: Elastic Container Service
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Managed containers
- **DigitalOcean App Platform**: Platform-as-a-Service

## Monitoring and Health Checks

- **Health Endpoint**: `/api/health` for status monitoring
- **Database Connectivity**: Connection pool health monitoring
- **Docker Health Checks**: Container-level health monitoring
- **Error Logging**: Comprehensive error tracking and logging

## License

ISC 