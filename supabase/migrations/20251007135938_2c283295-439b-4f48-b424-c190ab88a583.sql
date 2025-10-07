-- First, update sort_order for all steps >= 4 to make room for the missing step
UPDATE public.call_steps 
SET sort_order = sort_order + 1 
WHERE tenant_id = '1&1' 
  AND workflow_name = 'Der perfekte Call' 
  AND sort_order >= 3;

-- Insert the missing "Kundendaten verifizieren" step
INSERT INTO public.call_steps (
  tenant_id, 
  workflow_name, 
  step_id, 
  title, 
  description, 
  communication, 
  category, 
  sort_order, 
  required, 
  step_type, 
  action_buttons,
  is_start_step,
  is_end_step,
  is_topic_step,
  is_service_plus_step,
  position_x,
  position_y,
  next_step_conditions
) VALUES (
  '1&1',
  'Der perfekte Call',
  '1&1_demo_4_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9),
  'Kundendaten verifizieren',
  'Überprüfen Sie die Identität und Daten des Kunden',
  'Ohne IVR: Zur Bearbeitung Ihres Anliegens benötige ich zunächst Ihren vollständigen Namen und Ihr Hotline-Kennwort.
Mit IVR: Können Sie mir bitte noch Ihren vollständigen Namen und Ihre Adresse bestätigen.',
  'Authentifizierung',
  3,
  true,
  'normal',
  '[{"actionType":"info","enabled":true,"icon":"!","id":"cbe58a66-98f8-46ba-ab52-a62328682928","label":"Problem aufgetreten","statusBackgroundColor":"bg-red-500","statusIcon":"⚠️","statusMessage":"Sagen Sie zum Kunden: \"Sie können Ihr Kennwort in der Servicewelt finden, gerne zeige ich Ihnen wo!\"\n\nAnsonsten SMS-Code versenden + kompletter Datenabgleich (vollständiger Name, Geburtsdatum, Adresse, letzte 3 Ziffern der IBAN) ","templateName":"Problem aufgetreten","variant":"destructive"}]'::jsonb,
  false,
  false,
  false,
  false,
  0,
  0,
  '[]'::jsonb
);