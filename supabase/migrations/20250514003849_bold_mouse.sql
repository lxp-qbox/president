/*
  # Create users table and custom fields table
  
  1. New Tables
    - `users`: Stores user registration data
      - `id` (uuid, primary key): Unique identifier
      - `created_at` (timestamp): When the user was created
      - `profile` (text): Name or nickname of the user
      - `user_id` (text): Numeric or text ID (e.g. 10.203.040)
      - `whatsapp` (text): International format phone number
      - `country` (text): User's country
      - `is_admin` (boolean): Whether the user is an admin
      - `custom_fields` (jsonb): Dynamic custom fields
      
    - `custom_fields`: Stores definitions for dynamic fields
      - `id` (uuid, primary key): Unique identifier
      - `created_at` (timestamp): When the field was created
      - `name` (text): Field name
      - `type` (text): Field type (text, number, boolean, select)
      - `options` (text[]): Options for select type fields
      - `required` (boolean): Whether the field is required
  
  2. Security
    - Enable RLS on both tables
    - Add policies for data access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  profile text NOT NULL,
  user_id text NOT NULL,
  whatsapp text NOT NULL,
  country text NOT NULL,
  is_admin boolean DEFAULT false,
  custom_fields jsonb DEFAULT '{}'::jsonb
);

-- Create custom fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'select')),
  options text[] DEFAULT '{}',
  required boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
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

-- Create policies for custom_fields table
CREATE POLICY "Anyone can view custom fields" 
  ON custom_fields FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated users can insert custom fields" 
  ON custom_fields FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update custom fields" 
  ON custom_fields FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete custom fields" 
  ON custom_fields FOR DELETE 
  TO authenticated
  USING (true);