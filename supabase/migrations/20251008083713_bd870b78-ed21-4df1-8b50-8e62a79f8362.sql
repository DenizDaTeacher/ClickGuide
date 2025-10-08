-- Fix: Update topics to reference the correct step_id for their tenant
UPDATE public.topics
SET step_id = (
  SELECT step_id 
  FROM public.call_steps 
  WHERE tenant_id = topics.tenant_id 
  AND workflow_name = 'Der perfekte Call' 
  AND is_topic_step = true 
  LIMIT 1
)
WHERE step_id NOT LIKE tenant_id || '%';