-- Add is_service_plus_step column to call_steps table
ALTER TABLE public.call_steps 
ADD COLUMN IF NOT EXISTS is_service_plus_step boolean DEFAULT false;