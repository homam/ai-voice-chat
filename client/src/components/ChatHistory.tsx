import React, { useEffect, useState } from 'react'

interface ChatRoom {
  id: string
  name?: string
  created_at: string
  updated_at: string
  message_count?: number
}

const ChatHistory = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingRooms, setDeletingRooms] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadChatRooms()
  }, [])

  const loadChatRooms = async () => {
    try {
      setIsLoading(true)
      const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
      const response = await fetch(`${baseUrl}/api/chat-rooms`)
      
      if (response.ok) {
        const rooms = await response.json()
        setChatRooms(rooms)
      } else {
        setError('Failed to load chat history')
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error)
      setError('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const resumeChat = (roomId: string) => {
    const newUrl = new URL(window.location.href)
    newUrl.pathname = '/'
    newUrl.searchParams.set('room', roomId)
    window.location.href = newUrl.toString()
  }

  const deleteChat = async (roomId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این گفتگو را حذف کنید؟')) {
      return
    }

    try {
      // Add room to deleting state
      setDeletingRooms(prev => new Set(prev).add(roomId))
      
      const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
      const response = await fetch(`${baseUrl}/api/chat-rooms/${roomId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from local state immediately
        setChatRooms(prev => prev.filter(room => room.id !== roomId))
        
        // Show success feedback
        const roomName = chatRooms.find(room => room.id === roomId)?.name || 'گفتگو'
        alert(`✅ "${roomName}" با موفقیت حذف شد`)
      } else {
        alert('❌ خطا در حذف گفتگو')
      }
    } catch (error) {
      console.error('Error deleting chat room:', error)
      alert('❌ خطا در حذف گفتگو')
    } finally {
      // Remove from deleting state
      setDeletingRooms(prev => {
        const newSet = new Set(prev)
        newSet.delete(roomId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری تاریخچه گفتگوها...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadChatRooms}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تاریخچه گفتگوها</h1>
            <p className="text-gray-600 text-sm">
              {chatRooms.length > 0 
                ? `${chatRooms.length} گفتگو یافت شد` 
                : 'گفتگوهای قبلی شما'
              }
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            گفتگوی جدید
          </button>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {chatRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">هیچ گفتگویی یافت نشد</h3>
            <p className="text-gray-500 mb-6">هنوز هیچ گفتگویی با دستیار پزشکی نداشته‌اید</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              شروع گفتگوی جدید
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {room.name || 'گفتگوی پزشکی'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      ایجاد شده در: {formatDate(room.created_at)}
                    </p>
                    <p className="text-gray-600 text-sm">
                      آخرین بروزرسانی: {formatDate(room.updated_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resumeChat(room.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      ادامه گفتگو
                    </button>
                    <button
                      onClick={() => deleteChat(room.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatHistory 