import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { transcribeRouter } from './routes/transcribe.js'
import { ttsRouter } from './routes/tts.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.use('/api/chat', chatRouter)
app.use('/api/transcribe', transcribeRouter)
app.use('/api/tts', ttsRouter)
app.use('/api/health', (req, res) => res.send('ok'))

const PORT = process.env.PORT || 3100
app.listen(PORT, () => console.log(`backend on :${PORT}`))