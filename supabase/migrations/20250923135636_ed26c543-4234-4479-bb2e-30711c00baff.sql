-- Delete existing steps first
DELETE FROM call_steps 
WHERE tenant_id IN ('DEMO', 'MEDIAMARKTSATURN', 'EON', 'DHL', '1&1') 
  AND workflow_name = 'Gesprächsschritte';

-- Copy all steps from default to DEMO project
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  'demo_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
  'DEMO' as tenant_id,
  title, description, communication, required, sort_order, 
  category, step_type, action_buttons, workflow_name
FROM call_steps 
WHERE tenant_id = 'default' AND workflow_name = 'Gesprächsschritte';

-- Copy all steps from default to MEDIAMARKTSATURN project
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  'mms_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
  'MEDIAMARKTSATURN' as tenant_id,
  title, description, communication, required, sort_order, 
  category, step_type, action_buttons, workflow_name
FROM call_steps 
WHERE tenant_id = 'default' AND workflow_name = 'Gesprächsschritte';

-- Copy all steps from default to EON project
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  'eon_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
  'EON' as tenant_id,
  title, description, communication, required, sort_order, 
  category, step_type, action_buttons, workflow_name
FROM call_steps 
WHERE tenant_id = 'default' AND workflow_name = 'Gesprächsschritte';

-- Copy all steps from default to DHL project
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  'dhl_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
  'DHL' as tenant_id,
  title, description, communication, required, sort_order, 
  category, step_type, action_buttons, workflow_name
FROM call_steps 
WHERE tenant_id = 'default' AND workflow_name = 'Gesprächsschritte';

-- Copy all steps from default to 1&1 project
INSERT INTO call_steps (
  step_id, tenant_id, title, description, communication, 
  required, sort_order, category, step_type, action_buttons, workflow_name
)
SELECT 
  '1und1_' || ROW_NUMBER() OVER (ORDER BY sort_order) as step_id,
  '1&1' as tenant_id,
  title, description, communication, required, sort_order, 
  category, step_type, action_buttons, workflow_name
FROM call_steps 
WHERE tenant_id = 'default' AND workflow_name = 'Gesprächsschritte';