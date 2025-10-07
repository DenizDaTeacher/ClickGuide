-- Create workflow_templates table for storing reusable workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  template_data jsonb NOT NULL, -- Will store all steps, buttons, topics etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by text DEFAULT 'system'
);

-- Enable RLS
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Create policies - templates are readable by everyone, only admins can modify
CREATE POLICY "Templates are readable by everyone"
  ON workflow_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Templates can be inserted by system"
  ON workflow_templates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Templates can be updated by system"
  ON workflow_templates FOR UPDATE
  USING (true);

CREATE POLICY "Templates can be deleted by system"
  ON workflow_templates FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert "Der perfekte Call" template with current DEMO steps
INSERT INTO workflow_templates (name, description, is_default, template_data)
SELECT 
  'Der perfekte Call',
  'Standard-Gesprächsleitfaden für alle Call-Center Projekte',
  true,
  jsonb_build_object(
    'steps', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'step_id', step_id,
          'title', title,
          'description', description,
          'communication', communication,
          'required', required,
          'parent_step_id', parent_step_id,
          'step_type', step_type,
          'condition_label', condition_label,
          'next_step_conditions', next_step_conditions,
          'position_x', position_x,
          'position_y', position_y,
          'is_start_step', is_start_step,
          'is_end_step', is_end_step,
          'is_topic_step', is_topic_step,
          'is_service_plus_step', is_service_plus_step,
          'category', category,
          'sort_order', sort_order,
          'workflow_name', 'Der perfekte Call',
          'action_buttons', action_buttons,
          'status_background_color', status_background_color,
          'status_icon', status_icon,
          'parent_topic_id', parent_topic_id,
          'topic_id', topic_id,
          'image_url', image_url
        ) ORDER BY sort_order
      )
      FROM call_steps 
      WHERE tenant_id = 'DEMO' 
        AND workflow_name = 'Gesprächsschritte'
        AND step_type != 'sub_step'
    ),
    'topics', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'name', name,
          'description', description,
          'icon', icon,
          'color', color,
          'sort_order', sort_order,
          'step_id', step_id
        ) ORDER BY sort_order
      ), '[]'::jsonb)
      FROM topics 
      WHERE tenant_id = 'DEMO' 
        AND is_active = true
    ),
    'button_templates', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'name', name,
          'label', label,
          'variant', variant,
          'icon', icon,
          'action_type', action_type,
          'status_message', status_message,
          'background_color', background_color,
          'status_icon', status_icon,
          'status_background_color', status_background_color
        )
      ), '[]'::jsonb)
      FROM button_templates 
      WHERE tenant_id = 'DEMO'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_workflow_templates_is_default ON workflow_templates(is_default) WHERE is_default = true;
CREATE INDEX idx_workflow_templates_is_active ON workflow_templates(is_active) WHERE is_active = true;