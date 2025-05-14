/*
  # Add user approval system
  
  1. Changes
    - Add `approved` column to users table (boolean, defaults to false)
    - Add `approval_date` column to track when users were approved
    - Add `approved_by` column to track which admin approved the user
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE users
ADD COLUMN approved boolean DEFAULT false,
ADD COLUMN approval_date timestamptz,
ADD COLUMN approved_by uuid REFERENCES users(id);