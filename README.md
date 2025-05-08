# SocialMuse - Social Media Content Generator

SocialMuse is a comprehensive social media content generation tool that helps you create optimized content for multiple platforms including LinkedIn, Instagram, Twitter, Facebook, and YouTube.

## Project Structure

This project consists of:

- **Frontend**: React application built with Vite, TypeScript, and Tailwind CSS
- **Backend**: Express.js server providing API endpoints for content generation and posting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

### Running the Application

You can run the frontend and backend separately or together:

```sh
# Run only the frontend
npm run dev

# Run only the backend
npm run server

# Run both frontend and backend together
npm run dev:all
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

## API Endpoints

### Health Check
- **GET /api/health**
  - Returns the status of the server
  - Response: `{ status: 'ok', message: 'Server is running' }`

### Generate Content
- **POST /api/generate**
  - Generates content for a specific platform
  - Request body: `{ platform: string }`
  - Platform options: 'linkedin', 'instagram', 'youtube', 'common'
  - Response: `{ content: string | object }`

### Generate JSON Content
- **POST /api/generate-json-content**
  - Generates content for multiple platforms in JSON format
  - Uses Google's Gemini API for content generation
  - Response: JSON object containing content for LinkedIn, Instagram, and Facebook
  - Example response:
  ```json
  {
    "linkedin": {
      "title": "LinkedIn Post",
      "content": "Content for LinkedIn..."
    },
    "instagram": {
      "title": "Instagram Caption",
      "content": "Content for Instagram...",
      "hashtags": "#ai, #tech, #innovation"
    },
    "facebook": {
      "title": "Facebook Update",
      "content": "Content for Facebook..."
    }
  }
  ```

### Post Content
- **POST /api/post**
  - Posts content to a specific platform (simulated)
  - Request body: `{ platform: string, content: string | object }`
  - Response: `{ success: boolean, message: string, postId: string }`

## Technologies Used

- **Frontend**:
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Query

- **Backend**:
  - Express.js
  - Node.js
  - dotenv
  - cors

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### API Key Security

For security reasons, API keys should be stored as environment variables and not hardcoded in your application. This project uses a `.env` file to manage environment variables.

#### Setting Up Environment Variables

1. Create a `.env` file in the root directory of your project (if it doesn't exist already)
2. Add your API keys to the file:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

#### Accessing Environment Variables

In the server-side code, environment variables are accessed using `process.env`:

```javascript
const apiKey = process.env.GEMINI_API_KEY;
```

Never commit your `.env` file to version control. The `.env.example` file is provided as a template for the required environment variables.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
