import React from 'react'
import VoiceChat from './components/VoiceChat'
import ChatHistory from './components/ChatHistory'

const App = () => {
	// Simple routing based on URL path
	const path = window.location.pathname
	
	if (path === '/history') {
		return <ChatHistory />
	}
	
	return (
		<div className='min-h-screen'>
			{/* Navigation Header */}
			<div className='bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-3'>
				<div className='max-w-4xl mx-auto flex justify-between items-center'>
					<div className='flex items-center space-x-6 gap-4'>
						<a 
							href='/' 
							className='text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors'
						>
							دستیار پزشکی
						</a>
						<a 
							href='/history' 
							className='text-gray-600 hover:text-blue-600 transition-colors'
						>
							تاریخچه گفتگوها
						</a>
					</div>
					<div className='text-sm text-gray-500'>
						AI Voice Chat
					</div>
				</div>
			</div>
			
			<VoiceChat />
		</div>
	)
}

export default App