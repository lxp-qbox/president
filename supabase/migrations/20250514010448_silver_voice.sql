/*
  # Add URL field to users table

  1. Changes
    - Add `url` column to `users` table
*/

ALTER TABLE users
ADD COLUMN url text;