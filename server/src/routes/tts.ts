import { Router } from 'express'
import { openai } from '../openai.js'

export const ttsRouter = Router()

ttsRouter.post('/', async (req, res) => {
	const { text } = req.body as { text: string }

	if (!text || !text.trim()) {
		return res.status(400).json({ error: 'Text input is required and cannot be empty' })
	}

	const mp3 = await openai.audio.speech.create({
		model: 'tts-1-hd',
		voice: 'alloy',
		input: text
	})

	res.setHeader('Content-Type', 'audio/mpeg')
	res.send(Buffer.from(await mp3.arrayBuffer()))
})