-- Add workflow support for multiple lists
ALTER TABLE public.call_steps 
ADD COLUMN IF NOT EXISTS workflow_name text NOT NULL DEFAULT 'Gesprächsschritte';

-- Create index for better performance if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_call_steps_workflow_name') THEN
        CREATE INDEX idx_call_steps_workflow_name ON public.call_steps(workflow_name);
    END IF;
END $$;

-- Insert original 5 conversation steps with correct step_type values
INSERT INTO public.call_steps (
  step_id, title, description, communication, step_type, required, sort_order, workflow_name
) VALUES 
(
  'step_1_kundenanliegen',
  'Kundenanliegen erfassen',
  'Identifizieren und dokumentieren Sie das Hauptanliegen des Kunden',
  'Guten Tag, wie kann ich Ihnen heute helfen? Können Sie mir Ihr Anliegen genauer schildern?',
  'normal',
  true,
  1,
  'Gesprächsschritte'
),
(
  'step_2_kundendaten',
  'Kundendaten verifizieren',
  'Überprüfen Sie die Identität und Daten des Kunden',
  'Zur Bearbeitung Ihres Anliegens benötige ich zunächst Ihre Kundennummer oder Ihren Namen und Geburtsdatum.',
  'normal',
  true,
  2,
  'Gesprächsschritte'
),
(
  'step_3_problemanalyse',
  'Problemanalyse durchführen',
  'Analysieren Sie das Problem und sammeln Sie alle relevanten Informationen',
  'Lassen Sie mich das Problem genauer verstehen. Können Sie mir sagen, wann das Problem zum ersten Mal aufgetreten ist?',
  'normal',
  true,
  3,
  'Gesprächsschritte'
),
(
  'step_4_loesungsvorschlag',
  'Lösungsvorschlag unterbreiten',
  'Bieten Sie dem Kunden eine passende Lösung für sein Problem an',
  'Basierend auf Ihrer Schilderung kann ich Ihnen folgende Lösung anbieten...',
  'decision',
  true,
  4,
  'Gesprächsschritte'
),
(
  'step_5_gespraechsabschluss',
  'Gesprächsabschluss',
  'Fassen Sie die Lösung zusammen und schließen Sie das Gespräch professionell ab',
  'Haben Sie noch weitere Fragen? Vielen Dank für Ihren Anruf und einen schönen Tag!',
  'normal',
  false,
  5,
  'Gesprächsschritte'
)
ON CONFLICT (step_id) DO NOTHING;