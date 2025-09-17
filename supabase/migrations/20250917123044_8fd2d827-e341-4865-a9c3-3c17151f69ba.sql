-- Add action_buttons column to call_steps table to store configured action buttons
ALTER TABLE public.call_steps 
ADD COLUMN action_buttons JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance when querying action buttons
CREATE INDEX idx_call_steps_action_buttons ON public.call_steps USING GIN(action_buttons);