import React from 'react'

interface LoadingMessageProps {
	message: string
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ message }) => {
	return (
		<div className='flex justify-start'>
			<div className='bg-white text-gray-800 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm border border-gray-100'>
				<div className='flex items-center space-x-2 space-x-reverse'>
					<div className='flex space-x-1 space-x-reverse'>
						<div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'></div>
						<div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
						<div className='w-2 h-2 bg-blue-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
					</div>
					<span className='text-sm font-medium'>{message}</span>
				</div>
			</div>
		</div>
	)
}

export default LoadingMessage 