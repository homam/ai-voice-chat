import React, { useCallback, useEffect, useRef, useState } from 'react'
import Message from './Message'
import LoadingMessage from './LoadingMessage'
import EmptyState from './EmptyState'
import RecordButton from './RecordButton'

type Message = { role: 'user' | 'assistant'; content: string }

const VoiceChat = () => {
	const [messages, setMessages] = useState<Message[]>([])
	const [chatRoomId, setChatRoomId] = useState<string | null>(null)
	const [chatRoomName, setChatRoomName] = useState<string | null>(null)
	const [recording, setRecording] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isTranscribing, setIsTranscribing] = useState(false)
	const [isLoadingChat, setIsLoadingChat] = useState(false)
	const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)
	const media = useRef<MediaRecorder | null>(null)
	const chunks = useRef<Blob[]>([])
	const audioRef = useRef<HTMLAudioElement | null>(null)

	// Load chat room from URL query parameter on component mount
	useEffect(() => {
		const loadChatFromUrl = async () => {
			const urlParams = new URLSearchParams(window.location.search)
			const roomId = urlParams.get('room')
			
			if (roomId) {
				console.log('🔄 Loading chat room from URL:', roomId)
				setIsLoadingChat(true)
				try {
					const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
					const response = await fetch(`${baseUrl}/api/chat-rooms/${roomId}`)
					
					if (response.ok) {
						const chatRoom = await response.json()
						setChatRoomId(chatRoom.id)
						setChatRoomName(chatRoom.name || null)
						
						// Convert database messages to frontend format
						const frontendMessages: Message[] = chatRoom.messages.map((msg: any) => ({
							role: msg.role as 'user' | 'assistant',
							content: msg.content
						}))
						
						setMessages(frontendMessages)
						console.log('✅ Chat room loaded with', frontendMessages.length, 'messages')
					} else {
						console.error('❌ Failed to load chat room:', response.status)
						// Remove invalid room ID from URL
						const newUrl = new URL(window.location.href)
						newUrl.searchParams.delete('room')
						window.history.replaceState({}, '', newUrl.toString())
					}
				} catch (error) {
					console.error('❌ Error loading chat room:', error)
					// Remove invalid room ID from URL
					const newUrl = new URL(window.location.href)
					newUrl.searchParams.delete('room')
					window.history.replaceState({}, '', newUrl.toString())
				} finally {
					setIsLoadingChat(false)
				}
			}
		}

		loadChatFromUrl()
	}, [])

	// Update URL when chat room ID changes
	useEffect(() => {
		if (chatRoomId) {
			const newUrl = new URL(window.location.href)
			newUrl.searchParams.set('room', chatRoomId)
			window.history.replaceState({}, '', newUrl.toString())
		} else {
			// Remove room parameter if no chat room
			const newUrl = new URL(window.location.href)
			newUrl.searchParams.delete('room')
			window.history.replaceState({}, '', newUrl.toString())
		}
	}, [chatRoomId])

	// Reset playing state when audio ends
	useEffect(() => {
		const audio = audioRef.current
		if (audio) {
			const handleEnded = () => setPlayingMessageIndex(null)
			audio.addEventListener('ended', handleEnded)
			return () => audio.removeEventListener('ended', handleEnded)
		}
	}, [])

	// start / stop media-recorder
	const toggleRecord = async () => {
		if (recording) {
			media.current?.stop()
		} else {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
				media.current = new MediaRecorder(stream)
				media.current.ondataavailable = e => chunks.current.push(e.data)
				media.current.onstop = handleStop
				media.current.start()
			} catch (error) {
				console.error('Error accessing microphone:', error)
				alert('خطا در دسترسی به میکروفون')
			}
		}
		setRecording(!recording)
	}

	// send blob -> /transcribe -> /chat -> /tts
	const handleStop = useCallback(async () => {
		const blob = new Blob(chunks.current, { type: 'audio/webm' })
		chunks.current = []

		setIsTranscribing(true)
		setIsLoading(true)

		try {
			const form = new FormData()
			form.append('audio', blob, 'audio.webm')

			const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
			const transcript = await fetch(`${baseUrl}/api/transcribe`, {
				method: 'POST',
				body: form
			}).then(r => r.json() as Promise<{ text: string }>)

			setIsTranscribing(false)

			const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: transcript.text }]
			setMessages(updatedMessages)

			// Get the last assistant response for context
			const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
			const lastResponse = lastAssistantMessage?.content

			// Fetch assistant reply with chat room integration
			const reply = await fetch(`${baseUrl}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					messages: updatedMessages,
					lastResponse: lastResponse,
					chatRoomId: chatRoomId
				})
			}).then(r => r.json() as Promise<{ text: string; chatRoomId: string; chatRoomName?: string }>)

			// Update chat room ID if this is a new conversation
			if (reply.chatRoomId && !chatRoomId) {
				setChatRoomId(reply.chatRoomId)
			}

			// Update chat room name if provided
			if (reply.chatRoomName) {
				setChatRoomName(reply.chatRoomName)
			}

			setMessages([...updatedMessages, { role: 'assistant' as const, content: reply.text }])
		} catch (error) {
			console.error('Error processing audio:', error)
			alert('خطا در پردازش صدا')
		} finally {
			setIsLoading(false)
			setIsTranscribing(false)
		}
	}, [messages, chatRoomId])

	// Function to play TTS for a specific message
	const playTTS = async (text: string, messageIndex: number) => {
		try {
			setPlayingMessageIndex(messageIndex)
			const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
			const blob = await fetch(`${baseUrl}/api/tts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			}).then(r => r.blob())
			
			if (audioRef.current) {
				audioRef.current.src = URL.createObjectURL(blob)
				await audioRef.current.play()
			}
		} catch (error) {
			console.error('Error playing TTS:', error)
			setPlayingMessageIndex(null)
		}
	}

	// Function to start a new conversation
	const startNewConversation = () => {
		setMessages([])
		setChatRoomId(null)
		setChatRoomName(null)
	}

	// Function to share current chat room
	const shareChatRoom = () => {
		if (chatRoomId) {
			const shareUrl = `${window.location.origin}${window.location.pathname}?room=${chatRoomId}`
			navigator.clipboard.writeText(shareUrl).then(() => {
				alert('لینک گفتگو کپی شد!')
			}).catch(() => {
				// Fallback for older browsers
				prompt('لینک گفتگو:', shareUrl)
			})
		}
	}

	return (
		<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col'>
			{/* Header */}
			<div className='bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 flex-shrink-0'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-gray-800 mb-1'>
						{chatRoomName || 'دستیار صوتی پزشکی'}
					</h1>
					<p className='text-gray-600 text-sm'>
						{chatRoomName 
							? 'ادامه گفتگوی پزشکی' 
							: 'با صحبت کردن، سوالات پزشکی خود را بپرسید'
						}
					</p>
					<div className='mt-2 flex flex-row gap-4'>
						<a 
							href='/history' 
							className='text-sm text-gray-600 hover:text-blue-600 underline'
						>
							تاریخچه گفتگوها
						</a>
						{chatRoomId && (
							<>
								<button
									onClick={startNewConversation}
									className='text-sm text-blue-600 hover:text-blue-800 underline'
								>
									شروع گفتگوی جدید
								</button>
								<button
									onClick={shareChatRoom}
									className='text-sm text-green-600 hover:text-green-800 underline'
								>
									اشتراک‌گذاری گفتگو
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Messages Container */}
			<div className='flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0'>
				{isLoadingChat && <LoadingMessage message="در حال بارگذاری گفتگو..." />}
				{!isLoadingChat && messages.length === 0 && <EmptyState />}
				
				{messages.map((m, i) => (
					<Message
						key={i}
						role={m.role}
						content={m.content}
						index={i}
						isPlaying={playingMessageIndex === i}
						onPlayClick={playTTS}
					/>
				))}

				{isTranscribing && <LoadingMessage message="در حال تبدیل صدا به متن..." />}
				{isLoading && !isTranscribing && <LoadingMessage message="در حال پردازش..." />}
			</div>

			<div className='flex-shrink-0 pb-4'>
				<RecordButton
					onClick={toggleRecord}
					recording={recording}
					isLoading={isLoading || isLoadingChat}
				/>
			</div>

			<audio ref={audioRef} hidden />
		</div>
	)
}

export default VoiceChat