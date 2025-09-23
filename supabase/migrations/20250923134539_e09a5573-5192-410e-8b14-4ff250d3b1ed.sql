-- Create default "Gesprächsschritte" workflow for all projects with unique step_ids
INSERT INTO public.call_steps (
  step_id,
  title,
  description,
  communication,
  required,
  sort_order,
  tenant_id,
  workflow_name,
  category,
  step_type,
  action_buttons
) VALUES
-- Steps for DEMO project
('demo_greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1, 'DEMO', 'Gesprächsschritte', 'Begrüßung', 'normal', '[{"id": "action-1", "label": "Weiter zum nächsten Schritt", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('demo_identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2, 'DEMO', 'Gesprächsschritte', 'Authentifizierung', 'normal', '[{"id": "action-2", "label": "Kunde identifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('demo_verification', 'Datenverifikation', 'Abgleich mit den im System hinterlegten Daten', 'Ich prüfe nun Ihre Angaben in unserem System...', true, 3, 'DEMO', 'Gesprächsschritte', 'Verifikation', 'normal', '[{"id": "action-3", "label": "Daten verifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),

-- Steps for MEDIAMARKTSATURN project  
('mms_greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1, 'MEDIAMARKTSATURN', 'Gesprächsschritte', 'Begrüßung', 'normal', '[{"id": "action-1", "label": "Weiter zum nächsten Schritt", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('mms_identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2, 'MEDIAMARKTSATURN', 'Gesprächsschritte', 'Authentifizierung', 'normal', '[{"id": "action-2", "label": "Kunde identifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('mms_verification', 'Datenverifikation', 'Abgleich mit den im System hinterlegten Daten', 'Ich prüfe nun Ihre Angaben in unserem System...', true, 3, 'MEDIAMARKTSATURN', 'Gesprächsschritte', 'Verifikation', 'normal', '[{"id": "action-3", "label": "Daten verifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),

-- Steps for EON project
('eon_greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1, 'EON', 'Gesprächsschritte', 'Begrüßung', 'normal', '[{"id": "action-1", "label": "Weiter zum nächsten Schritt", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('eon_identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2, 'EON', 'Gesprächsschritte', 'Authentifizierung', 'normal', '[{"id": "action-2", "label": "Kunde identifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('eon_verification', 'Datenverifikation', 'Abgleich mit den im System hinterlegten Daten', 'Ich prüfe nun Ihre Angaben in unserem System...', true, 3, 'EON', 'Gesprächsschritte', 'Verifikation', 'normal', '[{"id": "action-3", "label": "Daten verifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),

-- Steps for DHL project
('dhl_greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1, 'DHL', 'Gesprächsschritte', 'Begrüßung', 'normal', '[{"id": "action-1", "label": "Weiter zum nächsten Schritt", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('dhl_identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2, 'DHL', 'Gesprächsschritte', 'Authentifizierung', 'normal', '[{"id": "action-2", "label": "Kunde identifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('dhl_verification', 'Datenverifikation', 'Abgleich mit den im System hinterlegten Daten', 'Ich prüfe nun Ihre Angaben in unserem System...', true, 3, 'DHL', 'Gesprächsschritte', 'Verifikation', 'normal', '[{"id": "action-3", "label": "Daten verifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),

-- Steps for 1&1 project
('1und1_greeting', 'Begrüßung', 'Freundliche Begrüßung und Firmenvorstellung', 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?', true, 1, '1&1', 'Gesprächsschritte', 'Begrüßung', 'normal', '[{"id": "action-1", "label": "Weiter zum nächsten Schritt", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('1und1_identification', 'Kundenidentifikation', 'Sicherheitsabfrage zur Identitätsprüfung', 'Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.', true, 2, '1&1', 'Gesprächsschritte', 'Authentifizierung', 'normal', '[{"id": "action-2", "label": "Kunde identifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]'),
('1und1_verification', 'Datenverifikation', 'Abgleich mit den im System hinterlegten Daten', 'Ich prüfe nun Ihre Angaben in unserem System...', true, 3, '1&1', 'Gesprächsschritte', 'Verifikation', 'normal', '[{"id": "action-3", "label": "Daten verifiziert", "variant": "default", "actionType": "complete", "icon": "✓", "enabled": true}]');