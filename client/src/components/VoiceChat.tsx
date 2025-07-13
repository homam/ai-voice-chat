import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

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

			// Fetch assistant reply (non-streaming)
			const reply = await fetch(`${baseUrl}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: updatedMessages })
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

	// Custom markdown components for RTL and Persian styling
	const markdownComponents = {
		p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
		h1: ({ children }: any) => <h1 className="text-xl font-bold mb-3 text-gray-800">{children}</h1>,
		h2: ({ children }: any) => <h2 className="text-lg font-bold mb-2 text-gray-800">{children}</h2>,
		h3: ({ children }: any) => <h3 className="text-base font-bold mb-2 text-gray-800">{children}</h3>,
		ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1 mr-4">{children}</ul>,
		ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1 mr-4">{children}</ol>,
		li: ({ children }: any) => <li className="text-sm">{children}</li>,
		strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
		em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
		code: ({ children }: any) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
		pre: ({ children }: any) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3 text-sm">{children}</pre>,
		blockquote: ({ children }: any) => <blockquote className="border-r-4 border-blue-500 pr-3 mb-3 italic text-gray-700">{children}</blockquote>,
		a: ({ href, children }: any) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
	}

	return (
		<div className='rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-blue-50 to-indigo-100 w-full max-w-2xl mx-4'>
			<div className='text-center mb-6'>
				<h1 className='text-3xl font-bold text-gray-800 mb-2'>دستیار صوتی پزشکی</h1>
				<p className='text-gray-600 text-sm'>با صحبت کردن، سوالات پزشکی خود را بپرسید</p>
			</div>

			<div className='h-80 overflow-y-auto border-2 border-gray-200 rounded-2xl p-4 mb-6 bg-white shadow-inner space-y-3'>
				{messages.length === 0 && (
					<div className='text-center text-gray-500 py-8'>
						<p>برای شروع گفتگو، روی دکمه صحبت کلیک کنید</p>
					</div>
				)}
				
				{messages.map((m, i) => (
					<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
						<div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
							m.role === 'user' 
								? 'bg-blue-500 text-white rounded-br-md' 
								: 'bg-gray-100 text-gray-800 rounded-bl-md'
						}`}>
							{m.role === 'user' ? (
								<p className='text-sm leading-relaxed'>{m.content}</p>
							) : (
								<div className='relative'>
									<div className='text-sm leading-relaxed prose prose-sm max-w-none'>
										<ReactMarkdown components={markdownComponents}>
											{m.content}
										</ReactMarkdown>
									</div>
									<button
										onClick={() => playTTS(m.content, i)}
										disabled={playingMessageIndex === i}
										className={`mt-1 mr-1 p-2 rounded-full shadow-lg transition-colors duration-200 ${
											playingMessageIndex === i 
												? 'bg-gray-400 cursor-not-allowed' 
												: 'bg-blue-500 hover:bg-blue-600 text-white'
										}`}
										title='پخش صدا'
									>
										{playingMessageIndex === i ? (
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
										) : (
											<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
												<path fillRule='evenodd' d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.794a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z' clipRule='evenodd' />
											</svg>
										)}
									</button>
								</div>
							)}
						</div>
					</div>
				))}

				{isTranscribing && (
					<div className='flex justify-start'>
						<div className='bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3'>
							<div className='flex items-center space-x-2 space-x-reverse'>
								<div className='flex space-x-1 space-x-reverse'>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
								</div>
								<span className='text-sm'>در حال تبدیل صدا به متن...</span>
							</div>
						</div>
					</div>
				)}

				{isLoading && !isTranscribing && (
					<div className='flex justify-start'>
						<div className='bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3'>
							<div className='flex items-center space-x-2 space-x-reverse'>
								<div className='flex space-x-1 space-x-reverse'>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
									<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
								</div>
								<span className='text-sm'>در حال پردازش...</span>
							</div>
						</div>
					</div>
				)}
			</div>

			<button
				onClick={toggleRecord}
				disabled={isLoading}
				className={`w-full rounded-2xl py-4 font-semibold text-white transition-all duration-300 transform ${
					recording 
						? 'bg-red-500 hover:bg-red-600 scale-105 shadow-lg' 
						: isLoading 
							? 'bg-gray-400 cursor-not-allowed' 
							: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg'
				}`}
			>
				{recording ? (
					<div className='flex items-center justify-center space-x-2 space-x-reverse'>
						<div className='w-4 h-4 bg-white rounded-full animate-pulse'></div>
						<span>توقف ضبط</span>
					</div>
				) : isLoading ? (
					<span>لطفاً صبر کنید...</span>
				) : (
					<div className='flex items-center justify-center space-x-2 space-x-reverse'>
						<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
							<path fillRule='evenodd' d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' clipRule='evenodd' />
						</svg>
						<span>شروع صحبت</span>
					</div>
				)}
			</button>

			<audio ref={audioRef} hidden />
		</div>
	)
}

export default VoiceChat