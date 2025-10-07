-- Remove "Problem aufgetreten" button from step 1 (Begrüßung)
UPDATE call_steps 
SET action_buttons = '[]'::jsonb
WHERE step_id = 'greeting' 
AND tenant_id = 'DEMO';

-- Remove "Authentifizierung" button from step 3 (Kundendaten verifizieren)
-- Keep only the "Problem aufgetreten" button
UPDATE call_steps 
SET action_buttons = jsonb_build_array(
  jsonb_build_object(
    'id', 'cbe58a66-98f8-46ba-ab52-a62328682928',
    'icon', '!',
    'label', 'Problem aufgetreten',
    'enabled', true,
    'variant', 'destructive',
    'actionType', 'info',
    'statusIcon', '⚠️',
    'templateName', 'Problem aufgetreten',
    'statusMessage', 'Sagen Sie zum Kunden: "Sie können Ihr Kennwort in der Servicewelt finden, gerne zeige ich Ihnen wo!"

Ansonsten SMS-Code versenden + kompletter Datenabgleich (vollständiger Name, Geburtsdatum, Adresse, letzte 3 Ziffern der IBAN) ',
    'statusBackgroundColor', 'bg-red-500'
  )
)
WHERE step_id = 'demo_4' 
AND tenant_id = 'DEMO';