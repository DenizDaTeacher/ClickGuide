-- Add button template for "Authentifizierung" based on "Problem aufgetreten" button
INSERT INTO public.button_templates (
  name,
  label,
  variant,
  icon,
  action_type,
  status_message,
  status_icon,
  status_background_color,
  background_color
) VALUES (
  'Authentifizierung',
  'Authentifizierung',
  'destructive',
  '🔐',
  'error',
  'Authentifizierungsproblem erkannt',
  '⚠️',
  'bg-red-500/20',
  'bg-red-500'
);