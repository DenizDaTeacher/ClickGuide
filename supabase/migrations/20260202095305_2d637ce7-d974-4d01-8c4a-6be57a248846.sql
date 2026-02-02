-- Add conversation_id column to call_feedback table
ALTER TABLE public.call_feedback 
ADD COLUMN conversation_id text;

-- Create index for faster filtering
CREATE INDEX idx_call_feedback_conversation_id ON public.call_feedback(conversation_id);
CREATE INDEX idx_call_feedback_created_at ON public.call_feedback(created_at DESC);