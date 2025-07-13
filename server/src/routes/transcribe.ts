import { Router } from 'express'
import multer from 'multer'
import { openai } from '../openai.js'

const upload = multer({ storage: multer.memoryStorage() })
export const transcribeRouter = Router()

transcribeRouter.post('/', upload.single('audio'), async (req, res) => {
	const audio = req.file
	if (!audio) return res.status(400).json({ error: 'audio required' })

	// Create a File object from the buffer
	const file = new File([audio.buffer], audio.originalname || 'audio.webm', {
		type: audio.mimetype || 'audio/webm'
	})

	const transcription = await openai.audio.transcriptions.create({
		file: file,
		model: 'whisper-1',
		language: 'fa',
		prompt: `من سوالات درس پزشکی را می پرسم .`
	})

	res.json({ text: transcription.text })
})