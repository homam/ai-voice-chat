import { Pool, PoolConfig } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'voice_chat_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000ms
  query_timeout: 30000, // Add query timeout
  statement_timeout: 30000, // Add statement timeout
}

console.log('🔧 Database config:', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port
})

export const pool = new Pool(dbConfig)

// Set up pool event handlers for better debugging
pool.on('connect', (client) => {
  console.log('🔌 New database connection established')
  client.query('SET search_path TO ai_chat')
})

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err)
})

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    // Set search path to ai_chat schema
    await client.query('SET search_path TO ai_chat')
    console.log('✅ Database connected successfully with ai_chat schema')
    client.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// Initialize database with schema
export const initializeDatabase = async () => {
  return;
  // the default user does not have permission to create schema
  // so we need to create the schema manually
  // do not uncomment this code
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql')
    const schema = await fs.readFile(schemaPath, 'utf-8')
    
    const client = await pool.connect()
    // Set search path to ai_chat schema
    await client.query('SET search_path TO ai_chat')
    await client.query(schema)
    client.release()
    
    console.log('✅ Database schema initialized successfully in ai_chat schema')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
} 