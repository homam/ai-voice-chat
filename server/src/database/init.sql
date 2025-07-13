-- 1. Create the schema
CREATE SCHEMA ai_chat;

-- 2. Create the user (adjust password)
CREATE USER ai_chat_user WITH PASSWORD '******';

-- postgres://ai_chat_user:******@ts-1.crgtoqfewrtu.eu-central-1.rds.amazonaws.com/fun

-- 3. Grant usage and create privileges on the schema
GRANT USAGE, CREATE ON SCHEMA ai_chat TO ai_chat_user;

-- 4. Grant full privileges on existing objects in the schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai_chat TO ai_chat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ai_chat TO ai_chat_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA ai_chat TO ai_chat_user;

-- 5. Ensure future privileges are granted automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_chat
  GRANT ALL PRIVILEGES ON TABLES TO ai_chat_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA ai_chat
  GRANT ALL PRIVILEGES ON SEQUENCES TO ai_chat_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA ai_chat
  GRANT ALL PRIVILEGES ON FUNCTIONS TO ai_chat_user;

SET ROLE ai_chat_user;

