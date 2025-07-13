import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { transcribeRouter } from './routes/transcribe.js'
import { ttsRouter } from './routes/tts.js'
import { chatRoomsRouter } from './routes/chatRooms.js'
import { testConnection, initializeDatabase } from './database/config.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Initialize database on startup
const initializeApp = async () => {
  try {
    await testConnection()
    await initializeDatabase()
    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/transcribe', transcribeRouter)
app.use('/api/tts', ttsRouter)
app.use('/api/chat-rooms', chatRoomsRouter)
app.use('/api/health', (req, res) => res.send('ok'))

const PORT = process.env.PORT || 3100

// Start server after database initialization
initializeApp().then(() => {
  app.listen(PORT, () => console.log(`backend on :${PORT}`))
})