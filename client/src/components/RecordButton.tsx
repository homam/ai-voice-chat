import React from 'react'

interface RecordButtonProps {
	onClick: () => void
	recording: boolean
	isLoading: boolean
}

const RecordButton: React.FC<RecordButtonProps> = ({ onClick, recording, isLoading }) => {
	return (
		<div className='bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-6 py-6'>
			<div className='max-w-2xl mx-auto'>
				<button
					onClick={onClick}
					disabled={isLoading}
					className={`w-full rounded-2xl py-5 font-semibold text-white transition-all duration-300 transform shadow-lg ${
						recording 
							? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 scale-105' 
							: isLoading 
								? 'bg-gray-400 cursor-not-allowed' 
								: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105'
					}`}
				>
					{recording ? (
						<div className='flex items-center justify-center space-x-2 space-x-reverse'>
							<div className='w-5 h-5 bg-white rounded-full animate-pulse'></div>
							<span className='text-lg'>توقف ضبط</span>
						</div>
					) : isLoading ? (
						<span className='text-lg'>لطفاً صبر کنید...</span>
					) : (
						<div className='flex items-center justify-center space-x-2 space-x-reverse'>
							<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
								<path fillRule='evenodd' d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' clipRule='evenodd' />
							</svg>
							<span className='text-lg'>شروع صحبت</span>
						</div>
					)}
				</button>
			</div>
		</div>
	)
}

export default RecordButton 