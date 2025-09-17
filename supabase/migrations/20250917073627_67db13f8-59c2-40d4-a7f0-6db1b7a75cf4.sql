-- Add category column to call_steps table
ALTER TABLE public.call_steps 
ADD COLUMN category text;