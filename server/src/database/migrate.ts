import { pool } from './config.js'

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Add name column to chat_rooms table if it doesn't exist
    const addNameColumnQuery = `
      ALTER TABLE ai_chat.chat_rooms 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255)
    `
    
    await pool.query(addNameColumnQuery)
    console.log('✅ Added name column to chat_rooms table')
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error)
}

export { migrate } 