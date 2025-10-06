-- Add description column to objections table
ALTER TABLE public.objections 
ADD COLUMN IF NOT EXISTS description TEXT;