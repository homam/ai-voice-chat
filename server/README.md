# Voice Chat Backend with PostgreSQL

This backend provides a voice chat application with PostgreSQL database integration for persistent chat storage.

## Features

- **Voice Transcription**: Convert audio to text using OpenAI Whisper
- **AI Chat**: Medical assistant powered by GPT-4
- **Text-to-Speech**: Convert AI responses to audio
- **Chat Persistence**: Store chat rooms and messages in PostgreSQL
- **RESTful API**: Complete CRUD operations for chat management

## Database Schema

### ChatRoom
- `id` (UUID): Unique identifier
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### ChatMessage
- `id` (UUID): Unique identifier
- `chat_room_id` (UUID): Foreign key to ChatRoom
- `role` (VARCHAR): Message role ('user', 'assistant', 'system')
- `content` (TEXT): Message content
- `created_at` (TIMESTAMP): Creation timestamp

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE voice_chat_db;
   ```

### 3. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:
- `DB_USER`: PostgreSQL username (default: postgres)
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_NAME`: Database name (default: voice_chat_db)
- `DB_PASSWORD`: PostgreSQL password
- `DB_PORT`: PostgreSQL port (default: 5432)
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3100)

### 4. Run the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Chat Rooms
- `GET /api/chat-rooms` - Get all chat rooms
- `POST /api/chat-rooms` - Create a new chat room
- `GET /api/chat-rooms/:id` - Get chat room with messages
- `POST /api/chat-rooms/:id/messages` - Add message to chat room
- `DELETE /api/chat-rooms/:id` - Delete chat room

### Chat
- `POST /api/chat` - Send message and get AI response

### Voice Processing
- `POST /api/transcribe` - Convert audio to text
- `POST /api/tts` - Convert text to speech

### Health
- `GET /api/health` - Health check

## Architecture

The application follows a modular architecture:

- **Database Layer**: PostgreSQL connection and schema management
- **Repository Layer**: Data access objects for ChatRoom and ChatMessage
- **Service Layer**: Business logic for chat operations
- **Route Layer**: Express.js API endpoints
- **Integration**: OpenAI API for AI and voice processing

## Database Initialization

The database schema is automatically initialized when the server starts. The schema includes:

- Tables for chat rooms and messages
- Foreign key constraints
- Indexes for performance
- Automatic timestamp updates

## Error Handling

The application includes comprehensive error handling:

- Database connection errors
- Invalid input validation
- OpenAI API errors
- Graceful degradation for missing features 