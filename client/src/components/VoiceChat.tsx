import React, { useCallback, useEffect, useRef, useState } from 'react'
import Message from './Message'
import LoadingMessage from './LoadingMessage'
import EmptyState from './EmptyState'
import RecordButton from './RecordButton'

type Message = { role: 'user' | 'assistant'; content: string }

const VoiceChat = () => {
	const [messages, setMessages] = useState<Message[]>([])
	const [recording, setRecording] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isTranscribing, setIsTranscribing] = useState(false)
	const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)
	const media = useRef<MediaRecorder | null>(null)
	const chunks = useRef<Blob[]>([])
	const audioRef = useRef<HTMLAudioElement | null>(null)

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

			// Fetch assistant reply (non-streaming)
			const reply = await fetch(`${baseUrl}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					messages: updatedMessages,
					lastResponse: lastResponse
				})
			}).then(r => r.json() as Promise<{ text: string }>)

			setMessages([...updatedMessages, { role: 'assistant' as const, content: reply.text }])
		} catch (error) {
			console.error('Error processing audio:', error)
			alert('خطا در پردازش صدا')
		} finally {
			setIsLoading(false)
			setIsTranscribing(false)
		}
	}, [messages])

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



	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col'>
			{/* Header */}
			<div className='bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold text-gray-800 mb-1'>دستیار صوتی پزشکی</h1>
					<p className='text-gray-600 text-sm'>با صحبت کردن، سوالات پزشکی خود را بپرسید</p>
				</div>
			</div>

			{/* Messages Container */}
			<div className='flex-1 overflow-y-auto px-4 py-6 space-y-4'>
				{messages.length === 0 && <EmptyState />}
				
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

			<RecordButton
				onClick={toggleRecord}
				recording={recording}
				isLoading={isLoading}
			/>

			<audio ref={audioRef} hidden />
		</div>
	)
}

export default VoiceChat