import React from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
	content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
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
		<div className='text-sm leading-relaxed prose prose-sm max-w-none'>
			<ReactMarkdown components={markdownComponents}>
				{content}
			</ReactMarkdown>
		</div>
	)
}

export default MarkdownRenderer 