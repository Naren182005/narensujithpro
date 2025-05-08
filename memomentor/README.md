# MemoMentor - Augment AI Meeting Assistant

MemoMentor is an Augment AI application that helps professionals get more value from their meetings while reducing the cognitive load of note-taking and follow-up management.

## Project Overview

MemoMentor listens to meetings (with permission), transcribes the conversation, identifies key points, action items, and decisions, and then generates a structured summary. Unlike fully automated meeting tools, MemoMentor keeps humans in control by:

1. Allowing users to edit and approve all AI-generated content
2. Enabling customization of what information to extract based on meeting type
3. Learning from user corrections to improve over time
4. Integrating with human workflows rather than replacing them

## Features

- **Meeting Management**: Schedule, organize, and track meetings
- **Audio Recording**: Record meeting conversations directly in the app
- **Transcription**: Convert speech to text using OpenAI's Whisper API
- **AI Analysis**: Extract key points, decisions, action items, and questions
- **Human-in-the-Loop**: Review and edit AI-generated summaries
- **Learning System**: Improve over time based on user feedback
- **Sharing**: Share meeting summaries with participants

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- OpenAI API (GPT-4 and Whisper)
- Langchain
- JWT Authentication

### Frontend
- React.js
- React Router
- React Bootstrap
- Axios
- Context API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository
```
git clone <repository-url>
cd memomentor
```

2. Install dependencies for both backend and frontend
```
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memomentor
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development servers
```
# Start backend server (from the server directory)
npm run dev

# Start frontend server (from the client directory)
npm start
```

## Project Structure

```
memomentor/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/                # Source files
│       ├── components/     # React components
│       ├── context/        # Context API
│       └── App.js          # Main application component
│
└── server/                 # Backend Node.js application
    ├── models/             # MongoDB models
    ├── routes/             # API routes
    ├── services/           # Business logic
    ├── middleware/         # Express middleware
    └── index.js            # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Meetings
- `GET /api/meetings` - Get all meetings for the current user
- `GET /api/meetings/:id` - Get a specific meeting
- `POST /api/meetings` - Create a new meeting
- `PUT /api/meetings/:id` - Update a meeting
- `DELETE /api/meetings/:id` - Delete a meeting
- `POST /api/meetings/:id/transcript` - Add transcript to a meeting
- `PUT /api/meetings/:id/summary` - Update meeting summary

### Transcription and Analysis
- `POST /api/transcribe` - Transcribe audio
- `POST /api/analyze` - Analyze transcript

## Future Improvements

- **Enhanced AI Capabilities**: Add sentiment analysis, speaker identification, and topic modeling
- **Advanced Augmentation Features**: Implement real-time suggestions and meeting coaching
- **Integration Expansions**: Connect with project management tools, CRM systems, and knowledge bases
- **Enterprise Features**: Add team management, role-based access controls, and analytics dashboards
- **Mobile and Offline Capabilities**: Build mobile apps and implement offline recording

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4 and Whisper APIs
- The Langchain team for their framework
- All contributors to this project
