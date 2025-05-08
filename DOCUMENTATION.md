# SocialMuse Documentation

## Overview

SocialMuse is a comprehensive social media content generation and management tool. It helps users create optimized content for multiple platforms including LinkedIn, Instagram, Facebook, and YouTube.

## Architecture

The application follows a modern React architecture with the following key components:

### Frontend

- **React**: UI library for building the user interface
- **TypeScript**: For type safety and better developer experience
- **React Router**: For client-side routing
- **Shadcn UI**: Component library for consistent design
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Query**: For data fetching, caching, and state management
- **Axios**: For making HTTP requests to the backend

### Backend

- **Express.js**: Web framework for the API
- **MongoDB**: Database for storing user data and content
- **JWT**: For authentication and authorization
- **Node.js**: Runtime environment

## Key Features

1. **Content Generation**: AI-powered content generation for different social media platforms
2. **Content Management**: Save, edit, and organize content
3. **Multi-platform Support**: Support for LinkedIn, Instagram, Facebook, and YouTube
4. **Scheduling**: Schedule posts for optimal times
5. **Analytics**: Track performance of your content (coming soon)
6. **Social Media Integration**: Connect your social media accounts

## Project Structure

```
/
├── public/              # Static assets
├── server/              # Backend API
│   ├── chatgpt-service.js   # AI content generation service
│   ├── social-auth-service.js # Social media authentication
│   └── social-post-service.js # Social media posting
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components from shadcn
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and services
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Configuration

The application uses a centralized configuration system in `src/config.ts`. This file contains environment-specific settings that are used throughout the application.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key

# API Keys
OPENAI_API_KEY=your-openai-api-key

# Social Media API Keys
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
```

## API Endpoints

### Authentication

- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login with email and password
- `POST /api/users/direct-login`: Login without 2FA (development only)
- `POST /api/users/logout`: Logout the current user

### Content

- `POST /api/generate`: Generate content for a platform
- `POST /api/post/:platform`: Post content to a specific platform
- `POST /api/post/multiple`: Post content to multiple platforms
- `GET /api/drafts`: Get all saved drafts
- `POST /api/drafts`: Save a draft
- `GET /api/drafts/:id`: Get a specific draft
- `PATCH /api/drafts/:id`: Update a draft
- `DELETE /api/drafts/:id`: Delete a draft

### Social Accounts

- `GET /api/social-accounts`: Get all connected accounts
- `POST /api/social-accounts/connect/:platform`: Connect a social media account
- `DELETE /api/social-accounts/disconnect/:platform/:id`: Disconnect a social media account
- `PATCH /api/social-accounts/update/:platform/:id`: Update a social media account

## Error Handling

The application uses a centralized error handling system in `src/lib/error-handler.ts`. This provides consistent error handling and user feedback throughout the application.

## Development

### Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Start the backend server:
   ```
   npm run server
   ```

4. Or run both simultaneously:
   ```
   npm run dev:all
   ```

### Building for Production

```
npm run build
```

## Deployment

The application can be deployed to any hosting service that supports Node.js applications. The frontend is built as a static site that can be served by the Express.js backend or a separate static file server.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
