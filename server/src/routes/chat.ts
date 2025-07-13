import { Router } from 'express'
import type { Response, Request } from 'express'
import { openai } from '../openai.js'
import type { ChatMessage } from '../types.js'

export const chatRouter = Router()

chatRouter.post('/', async (req: Request, res: Response) => {
	const messages = req.body.messages as ChatMessage[]
	const lastResponse = req.body.lastResponse as string | undefined

	// Build system message with context
	let systemMessage = 'شما مد-ویس بادی هستید، یک دستیار مختصر و مبتنی بر شواهد که به کاربر در مطالعه پزشکی کمک می‌کند. اگر مطمئن نیستید، با وضوح بیان کنید.'
	
	// Add last response as context if provided
	if (lastResponse) {
		systemMessage += `\n\nپاسخ قبلی شما: ${lastResponse}\n\nلطفاً در پاسخ‌های بعدی به این پاسخ قبلی اشاره کنید و اطلاعات تکمیلی ارائه دهید.`
	}

	// For answering medical questions in Persian for a medical student, the best available OpenAI model is currently `gpt-4o` (or `gpt-4o-mini` for cost/speed), as it supports Persian and has strong reasoning and medical knowledge. 
	// If you need more specialized or locally hosted models, consider Persian-trained LLMs like "ParsBERT" or "GPT-4 Med" (if available), but for general use, OpenAI's GPT-4o is recommended.
	const completion = await openai.chat.completions.create({
		model: 'gpt-4o',
		temperature: 0.2,
		messages: [
			{
				role: 'system',
				content: systemMessage
			},
			...messages
		]
	})

	const assistant = completion.choices[0]?.message?.content || ''
	res.json({ text: assistant })
})