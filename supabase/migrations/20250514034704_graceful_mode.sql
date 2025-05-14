/*
  # Add unique constraint to users table id

  1. Changes
    - Add unique constraint to id column in users table to ensure proper updates
    
  2. Security
    - Ensures no duplicate IDs can exist in the table
    - Required for proper row-level updates
*/

-- Add unique constraint to users table id column
ALTER TABLE users
ADD CONSTRAINT users_id_key UNIQUE (id);