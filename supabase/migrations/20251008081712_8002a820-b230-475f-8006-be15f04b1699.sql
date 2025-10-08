-- Fix: Ensure sub-steps and topics are copied to all tenants
DO $$
DECLARE
  target_tenant TEXT;
  source_tenant TEXT := '1&1';
BEGIN
  FOR target_tenant IN 
    SELECT DISTINCT id 
    FROM public.tenants 
    WHERE id != source_tenant 
    AND is_active = true
  LOOP
    -- Copy sub_steps (update if exists, insert if not)
    INSERT INTO public.call_steps (
      tenant_id,
      workflow_name,
      step_id,
      title,
      description,
      communication,
      category,
      sort_order,
      required,
      step_type,
      parent_step_id,
      condition_label,
      next_step_conditions,
      position_x,
      position_y,
      is_start_step,
      is_end_step,
      is_topic_step,
      is_service_plus_step,
      status_icon,
      status_background_color,
      image_url,
      action_buttons,
      topic_id,
      parent_topic_id
    )
    SELECT 
      target_tenant,
      workflow_name,
      step_id,
      title,
      description,
      communication,
      category,
      sort_order,
      required,
      step_type,
      parent_step_id,
      condition_label,
      next_step_conditions,
      position_x,
      position_y,
      is_start_step,
      is_end_step,
      is_topic_step,
      is_service_plus_step,
      status_icon,
      status_background_color,
      image_url,
      action_buttons,
      topic_id,
      parent_topic_id
    FROM public.call_steps
    WHERE tenant_id = source_tenant
    AND workflow_name = 'Der perfekte Call'
    AND step_type = 'sub_step'
    ON CONFLICT (step_id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      communication = EXCLUDED.communication,
      parent_topic_id = EXCLUDED.parent_topic_id;
    
    -- Copy/update topics for this tenant
    INSERT INTO public.topics (
      id,
      tenant_id,
      step_id,
      name,
      description,
      icon,
      color,
      sort_order,
      is_active
    )
    SELECT 
      id, -- Keep same UUID
      target_tenant,
      target_tenant || '_' || substring(step_id from position('_' in step_id) + 1),
      name,
      description,
      icon,
      color,
      sort_order,
      is_active
    FROM public.topics
    WHERE tenant_id = source_tenant
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      step_id = EXCLUDED.step_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      color = EXCLUDED.color,
      sort_order = EXCLUDED.sort_order;
    
    RAISE NOTICE 'Synced sub-steps and topics for: %', target_tenant;
  END LOOP;
END $$;