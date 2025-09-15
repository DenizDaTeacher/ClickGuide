-- Create table for storing call steps
CREATE TABLE public.call_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  communication TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.call_steps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read call steps (public configuration)
CREATE POLICY "Call steps are publicly readable" 
ON public.call_steps 
FOR SELECT 
USING (true);

-- Create policy to allow everyone to insert call steps (for now, until proper auth)
CREATE POLICY "Call steps can be inserted by anyone" 
ON public.call_steps 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow everyone to update call steps (for now, until proper auth)
CREATE POLICY "Call steps can be updated by anyone" 
ON public.call_steps 
FOR UPDATE 
USING (true);

-- Create policy to allow everyone to delete call steps (for now, until proper auth)
CREATE POLICY "Call steps can be deleted by anyone" 
ON public.call_steps 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_call_steps_updated_at
BEFORE UPDATE ON public.call_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.call_steps (step_id, title, description, communication, required, sort_order) VALUES
('greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1),
('identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2),
('verification', 'Datenverifikation', 'Zusätzliche Sicherheitsabfrage', 'Können Sie mir bitte noch Ihre aktuelle Adresse bestätigen?', true, 3),
('data-privacy', 'Datenschutz', 'Datenschutzhinweise mitteilen', 'Ich weise Sie darauf hin, dass unser Gespräch zu Qualitätszwecken aufgezeichnet wird.', true, 4),
('request-details', 'Anliegen erfassen', 'Detaillierte Aufnahme des Kundenanliegens', 'Können Sie mir Ihr Anliegen bitte genauer schildern?', false, 5);