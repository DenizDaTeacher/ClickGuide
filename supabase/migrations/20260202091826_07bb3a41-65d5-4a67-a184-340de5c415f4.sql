-- Add scale_questions column to feedback_settings
ALTER TABLE public.feedback_settings 
ADD COLUMN scale_questions jsonb NOT NULL DEFAULT '[{"id": "self_performance", "question": "Wie bewertest du deine eigene Leistung?", "required": false}]'::jsonb;

-- Add scale_responses column to call_feedback
ALTER TABLE public.call_feedback 
ADD COLUMN scale_responses jsonb NOT NULL DEFAULT '[]'::jsonb;