import { pool } from './config.js'
import { 
  ChatRoom, 
  ChatMessage, 
  CreateChatRoomRequest, 
  CreateChatMessageRequest,
  ChatRoomWithMessages 
} from './models.js'
import { openai } from '../openai.js'

export class ChatRoomRepository {
  async create(data: CreateChatRoomRequest): Promise<ChatRoom> {
    const query = 'INSERT INTO chat_rooms DEFAULT VALUES RETURNING *'
    console.log('🔍 [ChatRoomRepository.create] Query:', query)
    const result = await pool.query(query)
    return result.rows[0]
  }

  async findById(id: string): Promise<ChatRoom | null> {
    const query = 'SELECT * FROM chat_rooms WHERE id = $1'
    console.log('🔍 [ChatRoomRepository.findById] Query:', query, 'Params:', [id])
    const result = await pool.query(query, [id])
    return result.rows[0] || null
  }

  async findAll(): Promise<ChatRoom[]> {
    const query = 'SELECT * FROM chat_rooms ORDER BY updated_at DESC'
    console.log('🔍 [ChatRoomRepository.findAll] Query:', query)
    const result = await pool.query(query)
    return result.rows
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM chat_rooms WHERE id = $1'
    console.log('🔍 [ChatRoomRepository.delete] Query:', query, 'Params:', [id])
    const result = await pool.query(query, [id])
    return (result.rowCount ?? 0) > 0
  }

  async updateName(id: string, name: string): Promise<boolean> {
    const query = 'UPDATE chat_rooms SET name = $1 WHERE id = $2'
    console.log('🔍 [ChatRoomRepository.updateName] Query:', query, 'Params:', [name, id])
    const result = await pool.query(query, [name, id])
    return (result.rowCount ?? 0) > 0
  }
}

export class ChatMessageRepository {
  async create(data: CreateChatMessageRequest): Promise<ChatMessage> {
    const query = `
      INSERT INTO chat_messages (chat_room_id, role, content) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `
    console.log('🔍 [ChatMessageRepository.create] Query:', query, 'Params:', [data.chat_room_id, data.role, data.content])
    const result = await pool.query(query, [data.chat_room_id, data.role, data.content])
    return result.rows[0]
  }

  async findByChatRoomId(chatRoomId: string): Promise<ChatMessage[]> {
    const query = 'SELECT * FROM chat_messages WHERE chat_room_id = $1 ORDER BY created_at ASC'
    console.log('🔍 [ChatMessageRepository.findByChatRoomId] Query:', query, 'Params:', [chatRoomId])
    const result = await pool.query(query, [chatRoomId])
    return result.rows
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const query = 'SELECT * FROM chat_messages WHERE id = $1'
    console.log('🔍 [ChatMessageRepository.findById] Query:', query, 'Params:', [id])
    const result = await pool.query(query, [id])
    return result.rows[0] || null
  }

  async deleteByChatRoomId(chatRoomId: string): Promise<number> {
    const query = 'DELETE FROM chat_messages WHERE chat_room_id = $1'
    console.log('🔍 [ChatMessageRepository.deleteByChatRoomId] Query:', query, 'Params:', [chatRoomId])
    const result = await pool.query(query, [chatRoomId])
    return result.rowCount ?? 0
  }
}

export class ChatService {
  private chatRoomRepo = new ChatRoomRepository()
  private chatMessageRepo = new ChatMessageRepository()

  async createChatRoom(): Promise<ChatRoom> {
    return await this.chatRoomRepo.create({})
  }

  async getChatRoomWithMessages(chatRoomId: string): Promise<ChatRoomWithMessages | null> {
    const chatRoom = await this.chatRoomRepo.findById(chatRoomId)
    if (!chatRoom) return null

    const messages = await this.chatMessageRepo.findByChatRoomId(chatRoomId)
    return { ...chatRoom, messages }
  }

  async addMessage(data: CreateChatMessageRequest): Promise<ChatMessage> {
    // Verify chat room exists
    const chatRoom = await this.chatRoomRepo.findById(data.chat_room_id)
    if (!chatRoom) {
      throw new Error('Chat room not found')
    }

    return await this.chatMessageRepo.create(data)
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    return await this.chatRoomRepo.findAll()
  }

  async deleteChatRoom(chatRoomId: string): Promise<boolean> {
    return await this.chatRoomRepo.delete(chatRoomId)
  }

  async updateChatRoomName(chatRoomId: string, name: string): Promise<boolean> {
    return await this.chatRoomRepo.updateName(chatRoomId, name)
  }

  async getMessageCount(chatRoomId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM chat_messages WHERE chat_room_id = $1'
    const result = await pool.query(query, [chatRoomId])
    return parseInt(result.rows[0].count)
  }

  async generateChatRoomName(chatRoomId: string): Promise<string> {
    try {
      // Get the first few messages to understand the conversation topic
      const query = `
        SELECT role, content 
        FROM chat_messages 
        WHERE chat_room_id = $1 
        ORDER BY created_at ASC 
        LIMIT 6
      `
      const result = await pool.query(query, [chatRoomId])
      const messages = result.rows

      if (messages.length === 0) {
        return 'گفتگوی جدید'
      }

      // Create a summary of the conversation for OpenAI
      const conversationSummary = messages
        .map(msg => `${msg.role === 'user' ? 'کاربر' : 'دستیار'}: ${msg.content}`)
        .join('\n')

      const prompt = `
بر اساس این گفتگو، یک نام کوتاه و مناسب (حداکثر 5 کلمه) برای این گفتگو انتخاب کنید:

${conversationSummary}

نام باید:
- کوتاه و مختصر باشد (حداکثر 5 کلمه)
- موضوع اصلی گفتگو را نشان دهد
- به فارسی باشد
- مناسب برای یک گفتگوی پزشکی باشد

فقط نام را برگردانید، بدون توضیح اضافی.
`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'شما یک دستیار هوشمند هستید که نام‌های مناسب برای گفتگوهای پزشکی انتخاب می‌کند.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 50
      })

      const generatedName = completion.choices[0]?.message?.content?.trim() || 'گفتگوی پزشکی'
      console.log('🏷️ Generated chat room name:', generatedName)
      
      return generatedName
    } catch (error) {
      console.error('❌ Error generating chat room name:', error)
      return 'گفتگوی پزشکی'
    }
  }
} 