/*
  # Add unique constraint to user_id

  1. Changes
    - Add unique constraint to user_id column in users table
    
  2. Security
    - Ensures no duplicate user IDs can be created
*/

ALTER TABLE users
ADD CONSTRAINT users_user_id_key UNIQUE (user_id);