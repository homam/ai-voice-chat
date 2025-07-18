import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	server: { 
		port: 5173, 
		host: true, 
		allowedHosts: true,
		proxy: {
			'/api': {
				target: process.env.VITE_BACKEND_URL || 'http://localhost:3100/',
				changeOrigin: true,
				// rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
})