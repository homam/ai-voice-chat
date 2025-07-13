import React from 'react'
import MarkdownRenderer from './MarkdownRenderer'
import PlayButton from './PlayButton'

interface MessageProps {
	role: 'user' | 'assistant'
	content: string
	index: number
	isPlaying: boolean
	onPlayClick: (content: string, index: number) => void
}

const Message: React.FC<MessageProps> = ({ role, content, index, isPlaying, onPlayClick }) => {
	const isUser = role === 'user'
	
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
			<div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
				isUser 
					? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
					: 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
			}`}>
				{isUser ? (
					<p className='text-sm leading-relaxed'>{content}</p>
				) : (
					<div className='relative'>
						<MarkdownRenderer content={content} />
						<PlayButton
							onClick={() => onPlayClick(content, index)}
							isPlaying={isPlaying}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default Message 