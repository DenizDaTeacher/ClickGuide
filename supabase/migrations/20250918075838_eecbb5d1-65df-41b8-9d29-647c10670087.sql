-- Add default button template for "Schritt überspringen"
INSERT INTO public.button_templates (
  name,
  label,
  variant,
  icon,
  action_type,
  status_message,
  status_icon,
  status_background_color
) VALUES (
  'Schritt überspringen',
  'Überspringen',
  'outline',
  '⏭️',
  'info',
  'Schritt wurde übersprungen',
  '⏭️',
  'bg-gray-500'
) ON CONFLICT (name) DO NOTHING;