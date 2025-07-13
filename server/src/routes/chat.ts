import { Router } from 'express'
import type { Response, Request } from 'express'
import { openai } from '../openai.js'
import type { ChatMessage } from '../types.js'
import { ChatService } from '../database/repositories.js'

export const chatRouter = Router()
const chatService = new ChatService()

chatRouter.post('/', async (req: Request, res: Response) => {
	try {
		console.log('📨 Chat request received:', {
			messagesCount: req.body.messages?.length,
			hasLastResponse: !!req.body.lastResponse,
			hasChatRoomId: !!req.body.chatRoomId
		})

		const messages = req.body.messages as ChatMessage[]
		const lastResponse = req.body.lastResponse as string | undefined
		const chatRoomId = req.body.chatRoomId as string | undefined

		// Create a new chat room if not provided
		let currentChatRoomId = chatRoomId
		if (!currentChatRoomId) {
			console.log('🏠 Creating new chat room...')
			const newChatRoom = await chatService.createChatRoom()
			currentChatRoomId = newChatRoom.id
			console.log('✅ New chat room created:', currentChatRoomId)
		} else {
			console.log('🏠 Using existing chat room:', currentChatRoomId)
		}

		// Store the user's last message in the database
		const lastUserMessage = messages[messages.length - 1]
		if (lastUserMessage && lastUserMessage.role === 'user' && lastUserMessage.content) {
			console.log('💾 Storing user message:', lastUserMessage.content.substring(0, 50) + '...')
			try {
				await chatService.addMessage({
					chat_room_id: currentChatRoomId,
					role: 'user',
					content: lastUserMessage.content
				})
				console.log('✅ User message stored successfully')
			} catch (error) {
				console.error('❌ Failed to store user message:', error)
				throw error
			}
		}

		// Build system message with context
		let systemMessage = 'شما مد-ویس بادی هستید، یک دستیار مختصر و مبتنی بر شواهد که به کاربر در مطالعه پزشکی کمک می‌کند. اگر مطمئن نیستید، با وضوح بیان کنید.'
		
		// Add last response as context if provided
		if (lastResponse) {
			systemMessage += `\n\nپاسخ قبلی شما: ${lastResponse}\n\nلطفاً در پاسخ‌های بعدی به این پاسخ قبلی اشاره کنید و اطلاعات تکمیلی ارائه دهید.`
		}

		console.log('🤖 Getting AI response...')
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

		const assistantResponse = completion.choices[0]?.message?.content || ''
		console.log('✅ AI response received:', assistantResponse.substring(0, 50) + '...')

		// Store the assistant's response in the database
		console.log('💾 Storing assistant message...')
		try {
			await chatService.addMessage({
				chat_room_id: currentChatRoomId,
				role: 'assistant',
				content: assistantResponse
			})
			console.log('✅ Assistant message stored successfully')
		} catch (error) {
			console.error('❌ Failed to store assistant message:', error)
			throw error
		}

		// Check if we should generate a name for the chat room (after 3 messages)
		let updatedChatRoomName: string | undefined
		try {
			const messageCount = await chatService.getMessageCount(currentChatRoomId)
			const chatRoom = await chatService.getChatRoomWithMessages(currentChatRoomId)
			console.log('📊 Current message count:', messageCount)
			
			if (messageCount >= 3 && !chatRoom?.name) {
				console.log('🏷️ Generating chat room name...')
				const generatedName = await chatService.generateChatRoomName(currentChatRoomId)
				await chatService.updateChatRoomName(currentChatRoomId, generatedName)
				updatedChatRoomName = generatedName
				console.log('✅ Chat room name updated:', generatedName)
			}
		} catch (error) {
			console.error('❌ Error handling chat room naming:', error)
			// Don't fail the entire request if naming fails
		}

		console.log('📤 Sending response to client')
		res.json({ 
			text: assistantResponse,
			chatRoomId: currentChatRoomId,
			chatRoomName: updatedChatRoomName
		})
	} catch (error) {
		console.error('❌ Error in chat endpoint:', error)
		res.status(500).json({ error: 'Failed to process chat request' })
	}
})