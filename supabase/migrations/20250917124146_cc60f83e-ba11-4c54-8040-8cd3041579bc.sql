-- Create table for global button templates
CREATE TABLE public.button_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'default',
  icon TEXT,
  action_type TEXT NOT NULL DEFAULT 'custom',
  status_message TEXT,
  background_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.button_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for button templates
CREATE POLICY "Button templates are publicly readable" 
ON public.button_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Button templates can be inserted by anyone" 
ON public.button_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Button templates can be updated by anyone" 
ON public.button_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Button templates can be deleted by anyone" 
ON public.button_templates 
FOR DELETE 
USING (true);

-- Add status_background_color and status_icon to call_steps
ALTER TABLE public.call_steps 
ADD COLUMN status_background_color TEXT,
ADD COLUMN status_icon TEXT;

-- Create trigger for automatic timestamp updates on button_templates
CREATE TRIGGER update_button_templates_updated_at
BEFORE UPDATE ON public.button_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();