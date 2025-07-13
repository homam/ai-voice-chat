# AI Voice Chat with PostgreSQL

A medical voice chat application with AI-powered responses and persistent chat storage using PostgreSQL.

## Features

- 🎤 **Voice Input**: Record audio and convert to text
- 🤖 **AI Assistant**: Medical assistant powered by GPT-4
- 🔊 **Text-to-Speech**: Convert AI responses to audio
- 💾 **Chat Persistence**: Store conversations in PostgreSQL
- 📱 **Modern UI**: Beautiful, responsive interface
- 🔄 **Real-time**: Live transcription and response

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (React + Vite)│◄──►│   (Express.js)  │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │ (GPT-4 + Whisper)│
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-voice-chat

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Database Setup

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE voice_chat_db;
   ```
3. Configure environment variables (see below)

### 3. Environment Configuration

Create `.env` files in both `server/` and `client/` directories:

**Server (.env):**
```env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=voice_chat_db
DB_PASSWORD=your_password
DB_PORT=5432

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3100
```

**Client (.env):**
```env
VITE_BACKEND_URL=http://localhost:3100
```

### 4. Initialize Database

```bash
cd server
npm run migrate
```

### 5. Run Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### 6. Test Database Integration

```bash
cd server
npm run test:db
```

## Database Schema

### ChatRoom
- `id` (UUID): Unique identifier
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last update time

### ChatMessage
- `id` (UUID): Unique identifier
- `chat_room_id` (UUID): Foreign key to ChatRoom
- `role` (VARCHAR): 'user', 'assistant', or 'system'
- `content` (TEXT): Message content
- `created_at` (TIMESTAMP): Creation time

## API Endpoints

### Chat Management
- `GET /api/chat-rooms` - List all chat rooms
- `POST /api/chat-rooms` - Create new chat room
- `GET /api/chat-rooms/:id` - Get chat room with messages
- `POST /api/chat-rooms/:id/messages` - Add message to chat room
- `DELETE /api/chat-rooms/:id` - Delete chat room

### Voice Processing
- `POST /api/chat` - Send message and get AI response
- `POST /api/transcribe` - Convert audio to text
- `POST /api/tts` - Convert text to speech

## Development

### Project Structure

```
ai-voice-chat/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── database/       # Database layer
│   │   │   ├── config.ts   # Database configuration
│   │   │   ├── models.ts   # TypeScript interfaces
│   │   │   ├── repositories.ts # Data access layer
│   │   │   └── schema.sql  # Database schema
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   └── package.json
└── README.md
```

### Available Scripts

**Backend:**
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Initialize database schema
- `npm run test:db` - Test database integration

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Production Deployment

1. Build the application:
   ```bash
   cd client && npm run build
   cd ../server && npm run build
   ```

2. Set up production environment variables

3. Start the server:
   ```bash
   cd server && npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License