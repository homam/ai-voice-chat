import React from 'react'

interface PlayButtonProps {
	onClick: () => void
	isPlaying: boolean
	title?: string
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, isPlaying, title = 'پخش صدا' }) => {
	return (
		<button
			onClick={onClick}
			disabled={isPlaying}
			className={`mt-1 mr-1 p-2 rounded-full shadow-lg transition-colors duration-200 ${
				isPlaying 
					? 'bg-gray-400 cursor-not-allowed' 
					: 'bg-blue-500 hover:bg-blue-600 text-white'
			}`}
			title={title}
		>
			{isPlaying ? (
				<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
			) : (
				<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
					<path fillRule='evenodd' d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.794a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z' clipRule='evenodd' />
				</svg>
			)}
		</button>
	)
}

export default PlayButton 