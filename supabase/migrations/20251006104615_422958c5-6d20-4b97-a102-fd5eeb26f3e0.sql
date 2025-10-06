-- Fix step_id column type in topics table
-- Drop the existing foreign key constraint first
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_step_id_fkey;

-- Change step_id from uuid to text
ALTER TABLE topics ALTER COLUMN step_id TYPE text USING step_id::text;

-- Recreate the foreign key constraint with correct type
ALTER TABLE topics 
ADD CONSTRAINT topics_step_id_fkey 
FOREIGN KEY (step_id) REFERENCES call_steps(step_id) ON DELETE CASCADE;