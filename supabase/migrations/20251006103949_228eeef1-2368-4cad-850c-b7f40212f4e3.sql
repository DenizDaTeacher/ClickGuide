-- Add topic support to call_steps
ALTER TABLE call_steps 
ADD COLUMN IF NOT EXISTS is_topic_step boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_topic_id uuid REFERENCES topics(id) ON DELETE CASCADE;

-- Add step_id to topics to link them to a specific step
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS step_id uuid REFERENCES call_steps(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_topics_step_id ON topics(step_id);
CREATE INDEX IF NOT EXISTS idx_call_steps_parent_topic_id ON call_steps(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_call_steps_is_topic_step ON call_steps(is_topic_step);

COMMENT ON COLUMN call_steps.is_topic_step IS 'Markiert ob dieser Schritt eine Topic-Auswahl (Anliegen-Schritt) ist';
COMMENT ON COLUMN call_steps.parent_topic_id IS 'Für Unterschritte: Verweist auf das übergeordnete Topic';
COMMENT ON COLUMN topics.step_id IS 'Verweist auf den Hauptschritt zu dem dieses Topic gehört';