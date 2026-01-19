-- Create call_feedback table for storing post-call self-assessments
CREATE TABLE public.call_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_analytics_id UUID REFERENCES public.call_analytics(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  workflow_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  
  -- Checklist items (configurable per tenant)
  checklist_responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Free-text notes
  notes TEXT,
  
  -- Overall self-rating (1-5)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create feedback_settings table for configurable checklist questions and settings
CREATE TABLE public.feedback_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'default' UNIQUE,
  
  -- Whether feedback is required after each call
  feedback_required BOOLEAN NOT NULL DEFAULT false,
  
  -- Checklist questions (array of question objects)
  checklist_questions JSONB NOT NULL DEFAULT '[
    {"id": "all_steps", "question": "Alle Pflichtschritte erledigt?", "required": true},
    {"id": "customer_satisfied", "question": "Kunde zufrieden?", "required": true},
    {"id": "upsell_attempted", "question": "Cross-/Upselling versucht?", "required": false}
  ]'::jsonb,
  
  -- Email recipients for feedback notifications
  notification_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for call_feedback
CREATE POLICY "Feedback is readable per tenant" 
ON public.call_feedback FOR SELECT 
USING (true);

CREATE POLICY "Feedback can be inserted" 
ON public.call_feedback FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Feedback can be updated" 
ON public.call_feedback FOR UPDATE 
USING (true);

-- RLS policies for feedback_settings
CREATE POLICY "Settings are readable per tenant" 
ON public.feedback_settings FOR SELECT 
USING (true);

CREATE POLICY "Settings can be inserted" 
ON public.feedback_settings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Settings can be updated" 
ON public.feedback_settings FOR UPDATE 
USING (true);

CREATE POLICY "Settings can be deleted" 
ON public.feedback_settings FOR DELETE 
USING (true);