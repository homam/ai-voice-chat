import { ChatService } from './repositories.js'

async function testDatabase() {
  const chatService = new ChatService()
  
  try {
    console.log('🧪 Testing database integration...')
    
    // Test 1: Create a chat room
    console.log('1. Creating chat room...')
    const chatRoom = await chatService.createChatRoom()
    console.log('✅ Chat room created:', chatRoom.id)
    
    // Test 2: Add a user message
    console.log('2. Adding user message...')
    const userMessage = await chatService.addMessage({
      chat_room_id: chatRoom.id,
      role: 'user',
      content: 'سلام، سوال پزشکی دارم'
    })
    console.log('✅ User message added:', userMessage.id)
    
    // Test 3: Add an assistant message
    console.log('3. Adding assistant message...')
    const assistantMessage = await chatService.addMessage({
      chat_room_id: chatRoom.id,
      role: 'assistant',
      content: 'سلام! چطور می‌تونم کمکتون کنم؟'
    })
    console.log('✅ Assistant message added:', assistantMessage.id)
    
    // Test 4: Get chat room with messages
    console.log('4. Fetching chat room with messages...')
    const chatRoomWithMessages = await chatService.getChatRoomWithMessages(chatRoom.id)
    console.log('✅ Chat room fetched with', chatRoomWithMessages?.messages.length, 'messages')
    
    // Test 5: Get all chat rooms
    console.log('5. Fetching all chat rooms...')
    const allChatRooms = await chatService.getAllChatRooms()
    console.log('✅ Found', allChatRooms.length, 'chat rooms')
    
    // Test 6: Clean up
    console.log('6. Cleaning up test data...')
    await chatService.deleteChatRoom(chatRoom.id)
    console.log('✅ Test chat room deleted')
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    throw error
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase().then(() => {
    console.log('✅ Test completed successfully')
    process.exit(0)
  }).catch(() => {
    console.log('❌ Test failed')
    process.exit(1)
  })
} 