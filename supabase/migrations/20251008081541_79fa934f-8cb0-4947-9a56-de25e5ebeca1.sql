-- Simpler approach: Only copy if not exists, and keep topic IDs consistent
DO $$
DECLARE
  target_tenant TEXT;
  source_tenant TEXT := '1&1';
  substep_exists BOOLEAN;
BEGIN
  FOR target_tenant IN 
    SELECT DISTINCT id 
    FROM public.tenants 
    WHERE id != source_tenant 
    AND is_active = true
  LOOP
    -- Delete existing main steps (not sub_steps) for this tenant
    DELETE FROM public.call_steps 
    WHERE tenant_id = target_tenant 
    AND workflow_name = 'Der perfekte Call'
    AND step_type != 'sub_step';
    
    -- Insert main steps with new tenant-specific step_ids
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
      target_tenant || '_' || substring(step_id from position('_' in step_id) + 1) as step_id,
      title,
      description,
      communication,
      category,
      sort_order,
      required,
      step_type,
      CASE 
        WHEN parent_step_id IS NOT NULL THEN target_tenant || '_' || substring(parent_step_id from position('_' in parent_step_id) + 1)
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
    AND workflow_name = 'Der perfekte Call'
    AND step_type != 'sub_step';
    
    -- Check if sub_steps already exist for this tenant
    SELECT EXISTS (
      SELECT 1 FROM public.call_steps
      WHERE tenant_id = target_tenant
      AND step_type = 'sub_step'
      LIMIT 1
    ) INTO substep_exists;
    
    -- Only copy sub_steps if they don't exist
    IF NOT substep_exists THEN
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
        step_id, -- Keep original for sub_steps
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
      ON CONFLICT (step_id) DO NOTHING;
    END IF;
    
    -- Update topics to reference new step_ids for topic steps
    UPDATE public.topics
    SET step_id = target_tenant || '_' || substring(step_id from position('_' in step_id) + 1)
    WHERE tenant_id = target_tenant
    AND step_id LIKE source_tenant || '%';
    
    RAISE NOTICE 'Synced workflow for tenant: %', target_tenant;
  END LOOP;
END $$;

-- Create master workflow tracking table
CREATE TABLE IF NOT EXISTS public.workflow_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  master_tenant_id TEXT NOT NULL,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workflow_name)
);

ALTER TABLE public.workflow_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master workflow readable" ON public.workflow_master FOR SELECT USING (true);
CREATE POLICY "Master workflow updatable" ON public.workflow_master FOR ALL USING (true);

INSERT INTO public.workflow_master (workflow_name, master_tenant_id, sync_enabled)
VALUES ('Der perfekte Call', 'DEMO', true)
ON CONFLICT (workflow_name) DO UPDATE SET
  master_tenant_id = 'DEMO',
  sync_enabled = true,
  updated_at = now();