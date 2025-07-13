export interface ChatRoom {
  id: string
  name?: string
  created_at: Date
  updated_at: Date
}

export interface ChatMessage {
  id: string
  chat_room_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: Date
}

export interface CreateChatRoomRequest {
  // No additional fields needed for now
}

export interface CreateChatMessageRequest {
  chat_room_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRoomWithMessages extends ChatRoom {
  messages: ChatMessage[]
} 