/*
  # Update users table structure
  
  1. Changes
    - Drop existing table and recreate with proper structure
    - Add serial ID for auto-incrementing numeric IDs
    - Add UUID for unique identifier
    - Add proper indexes and constraints
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- First, drop existing table (will cascade and remove dependencies)
DROP TABLE IF EXISTS users CASCADE;

-- Create the updated users table
CREATE TABLE users (
  -- Primary numeric ID (auto-incrementing)
  id BIGSERIAL PRIMARY KEY,
  -- UUID for external reference
  uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- User information
  profile TEXT NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  country TEXT NOT NULL,
  url TEXT,
  is_admin BOOLEAN DEFAULT false,
  status user_status DEFAULT 'pending',
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES users(uuid),
  custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for better performance
CREATE INDEX users_created_at_idx ON users(created_at);
CREATE INDEX users_updated_at_idx ON users(updated_at);
CREATE INDEX users_profile_idx ON users(profile);
CREATE INDEX users_user_id_idx ON users(user_id);
CREATE INDEX users_status_idx ON users(status);
CREATE INDEX users_approved_by_idx ON users(approved_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can insert users" 
  ON users FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view users" 
  ON users FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated users can update users" 
  ON users FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete users" 
  ON users FOR DELETE 
  TO authenticated
  USING (true);