UPDATE button_templates 
SET 
  label = 'Problem aufgetreten',
  action_type = 'fail',
  status_message = 'Authentifizierung fehlgeschlagen - Gespräch muss beendet werden'
WHERE name = 'Authentifizierung';