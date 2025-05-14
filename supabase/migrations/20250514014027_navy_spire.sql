/*
  # Update user status field
  
  1. Changes
    - Remove `approved` column
    - Add `status` column with enum type
    
  2. Security
    - Maintains existing RLS policies
*/

-- Create enum type for user status
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'banned');

-- Add status column and migrate existing data
ALTER TABLE users
ADD COLUMN status user_status DEFAULT 'pending';

-- Update existing approved users
UPDATE users
SET status = CASE 
  WHEN approved = true THEN 'approved'::user_status
  ELSE 'pending'::user_status
END;

-- Remove old approved column
ALTER TABLE users
DROP COLUMN approved;