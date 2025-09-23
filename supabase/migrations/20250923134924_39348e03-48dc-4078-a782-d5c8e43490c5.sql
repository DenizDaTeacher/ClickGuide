-- Copy ALL steps from default project to all other projects
-- First, let's see what we have in default
WITH default_steps AS (
  SELECT 
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM call_steps 
  WHERE tenant_id = 'default' 
    AND workflow_name = 'Gesprächsschritte'
),
project_steps AS (
  SELECT 
    'DEMO' as tenant_id, 
    'demo_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM default_steps
  
  UNION ALL
  
  SELECT 
    'MEDIAMARKTSATURN' as tenant_id, 
    'mms_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM default_steps
  
  UNION ALL
  
  SELECT 
    'EON' as tenant_id, 
    'eon_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM default_steps
  
  UNION ALL
  
  SELECT 
    'DHL' as tenant_id, 
    'dhl_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM default_steps
  
  UNION ALL
  
  SELECT 
    '1&1' as tenant_id, 
    '1und1_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
    title, description, communication, required, sort_order, 
    category, step_type, action_buttons, workflow_name
  FROM default_steps
)

-- Delete existing steps first to avoid conflicts
DELETE FROM call_steps 
WHERE tenant_id IN ('DEMO', 'MEDIAMARKTSATURN', 'EON', 'DHL', '1&1') 
  AND workflow_name = 'Gesprächsschritte';

-- Insert all default steps for each project with unique step_ids
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  step_id, tenant_id, title, description, communication,
  required, sort_order, category, step_type, action_buttons, workflow_name
FROM project_steps;