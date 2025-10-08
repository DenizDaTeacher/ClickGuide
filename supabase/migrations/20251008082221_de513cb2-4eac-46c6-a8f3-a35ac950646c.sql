-- Complete reset and proper sync
-- Step 1: Delete ALL call_steps for 'Der perfekte Call' except from 1&1
DELETE FROM public.call_steps
WHERE workflow_name = 'Der perfekte Call'
AND tenant_id != '1&1';

-- Step 2: Delete all topics except from 1&1
DELETE FROM public.topics
WHERE tenant_id != '1&1';

-- Step 3: Copy all steps from 1&1 to each tenant with proper step_id generation
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
    -- Insert all main steps with tenant-specific step_ids
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
      CASE 
        WHEN step_type = 'sub_step' THEN 'substep-' || target_tenant || '-' || EXTRACT(EPOCH FROM now())::bigint || '-' || substring(md5(random()::text), 1, 6)
        ELSE target_tenant || '_' || substring(step_id from position('_' in step_id) + 1)
      END as step_id,
      title,
      description,
      communication,
      category,
      sort_order,
      required,
      step_type,
      CASE 
        WHEN parent_step_id IS NOT NULL AND step_type != 'sub_step' 
        THEN target_tenant || '_' || substring(parent_step_id from position('_' in parent_step_id) + 1)
        ELSE NULL
      END as parent_step_id,
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
    AND workflow_name = 'Der perfekte Call';
    
    -- Copy topics with same UUID but updated step_id reference
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
      id,
      target_tenant,
      target_tenant || '_' || substring(step_id from position('_' in step_id) + 1),
      name,
      description,
      icon,
      color,
      sort_order,
      is_active
    FROM public.topics
    WHERE tenant_id = source_tenant;
    
    RAISE NOTICE 'Synced all data for: %', target_tenant;
  END LOOP;
END $$;