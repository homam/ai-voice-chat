import React from 'react'

const EmptyState: React.FC = () => {
	return (
		<div className='text-center text-gray-500 py-16'>
			<div className='max-w-md mx-auto'>
				<div className='w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
					<svg className='w-12 h-12 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
						<path fillRule='evenodd' d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' clipRule='evenodd' />
					</svg>
				</div>
				<h3 className='text-lg font-semibold text-gray-700 mb-2'>شروع گفتگو</h3>
				<p className='text-gray-500'>برای شروع گفتگو، روی دکمه صحبت در پایین صفحه کلیک کنید</p>
			</div>
		</div>
	)
}

export default EmptyState 