-- Set search path to ai_chat schema
SET search_path TO ai_chat;

-- Create ai_chat schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS ai_chat;

-- Create ChatRoom table
CREATE TABLE IF NOT EXISTS ai_chat.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
alter table ai_chat.chat_rooms add column if not exists name varchar(255);


-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS ai_chat.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES ai_chat.chat_rooms(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON ai_chat.chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON ai_chat.chat_messages(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION ai_chat.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chat_rooms table (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_chat_rooms_updated_at'
    ) THEN
        CREATE TRIGGER update_chat_rooms_updated_at 
            BEFORE UPDATE ON ai_chat.chat_rooms 
            FOR EACH ROW 
            EXECUTE FUNCTION ai_chat.update_updated_at_column();
    END IF;
END $$; 