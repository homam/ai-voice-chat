import { Router } from 'express'
import { ChatService } from '../database/repositories.js'
import { pool } from '../database/config.js'

const router = Router()
const chatService = new ChatService()

// Simple health check endpoint
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Health check requested...')
    const result = await pool.query('SELECT 1 as test')
    console.log('✅ Health check passed:', result.rows[0])
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      test: result.rows[0]
    })
  } catch (error) {
    console.error('❌ Health check failed:', error)
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Test endpoint to verify database connectivity
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing database connectivity...')
    
    // Test 1: Create a chat room
    const chatRoom = await chatService.createChatRoom()
    console.log('✅ Test chat room created:', chatRoom.id)
    
    // Test 2: Add a test message
    const message = await chatService.addMessage({
      chat_room_id: chatRoom.id,
      role: 'user',
      content: 'Test message'
    })
    console.log('✅ Test message added:', message.id)
    
    // Test 3: Get chat room with messages
    const chatRoomWithMessages = await chatService.getChatRoomWithMessages(chatRoom.id)
    console.log('✅ Chat room retrieved with', chatRoomWithMessages?.messages.length, 'messages')
    
    // Test 4: Clean up
    await chatService.deleteChatRoom(chatRoom.id)
    console.log('✅ Test data cleaned up')
    
    res.json({ 
      success: true, 
      message: 'Database test passed',
      chatRoomId: chatRoom.id,
      messageId: message.id
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get all chat rooms
router.get('/', async (req, res) => {
  try {
    const chatRooms = await chatService.getAllChatRooms()
    res.json(chatRooms)
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    res.status(500).json({ error: 'Failed to fetch chat rooms' })
  }
})

// Create a new chat room
router.post('/', async (req, res) => {
  try {
    const chatRoom = await chatService.createChatRoom()
    res.status(201).json(chatRoom)
  } catch (error) {
    console.error('Error creating chat room:', error)
    res.status(500).json({ error: 'Failed to create chat room' })
  }
})

// Get a specific chat room with messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const chatRoom = await chatService.getChatRoomWithMessages(id)
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' })
    }
    
    res.json(chatRoom)
  } catch (error) {
    console.error('Error fetching chat room:', error)
    res.status(500).json({ error: 'Failed to fetch chat room' })
  }
})

// Add a message to a chat room
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params
    const { role, content } = req.body

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' })
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const message = await chatService.addMessage({
      chat_room_id: id,
      role,
      content
    })

    res.status(201).json(message)
  } catch (error) {
    console.error('Error adding message:', error)
    if (error instanceof Error && error.message === 'Chat room not found') {
      return res.status(404).json({ error: 'Chat room not found' })
    }
    res.status(500).json({ error: 'Failed to add message' })
  }
})

// Delete a chat room
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await chatService.deleteChatRoom(id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Chat room not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting chat room:', error)
    res.status(500).json({ error: 'Failed to delete chat room' })
  }
})

export { router as chatRoomsRouter } 