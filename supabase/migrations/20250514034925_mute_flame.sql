/*
  # Fix user management and add constraints
  
  1. Changes
    - Add unique constraint to users table id column if not exists
    - Add foreign key constraint for approved_by if not exists
    - Add indexes for better query performance
    
  2. Security
    - Ensure data integrity with constraints
    - Improve query performance with indexes
*/

-- Add unique constraint if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_id_key UNIQUE (id);
  END IF;
END $$;

-- Add foreign key constraint if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_approved_by_fkey'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_approved_by_fkey 
    FOREIGN KEY (approved_by) 
    REFERENCES users(id);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at);
CREATE INDEX IF NOT EXISTS users_profile_idx ON users (profile);
CREATE INDEX IF NOT EXISTS users_user_id_idx ON users (user_id);