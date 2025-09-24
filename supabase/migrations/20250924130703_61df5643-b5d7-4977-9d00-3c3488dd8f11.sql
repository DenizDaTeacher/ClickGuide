-- Fix corrupted data: Update steps that are marked as sub_step but have no parent_step_id
UPDATE call_steps 
SET step_type = 'normal' 
WHERE step_type = 'sub_step' 
AND (parent_step_id IS NULL OR parent_step_id = '');

-- Also ensure proper sorting by setting sort_order based on current order for main steps
WITH ordered_steps AS (
  SELECT step_id, 
         ROW_NUMBER() OVER (PARTITION BY tenant_id, workflow_name ORDER BY sort_order, created_at) as new_sort_order
  FROM call_steps 
  WHERE step_type != 'sub_step' 
  AND (parent_step_id IS NULL OR parent_step_id = '')
)
UPDATE call_steps 
SET sort_order = ordered_steps.new_sort_order
FROM ordered_steps 
WHERE call_steps.step_id = ordered_steps.step_id;