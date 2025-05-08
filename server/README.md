# SocialMuse API Server

This is the backend server for the SocialMuse application, providing API endpoints for content generation and posting.

## API Endpoints

### Health Check
- **GET /api/health**
  - Returns the status of the server
  - Response: `{ status: 'ok', message: 'Server is running' }`

### Generate Content
- **POST /api/generate**
  - Generates content for a specific platform
  - Request body: `{ platform: string }`
  - Platform options: 'linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'common'
  - Response: `{ content: string | object }`

### Post Content
- **POST /api/post**
  - Posts content to a specific platform (simulated)
  - Request body: `{ platform: string, content: string | object }`
  - Response: `{ success: boolean, message: string, postId: string }`

## Running the Server

```bash
# Start the server
npm run server

# Start both frontend and backend
npm run dev:all
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
```

You can customize the port as needed.
