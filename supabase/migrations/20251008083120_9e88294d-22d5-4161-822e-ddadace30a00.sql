-- Create unique topics for each tenant
DO $$
DECLARE
  tenant_rec RECORD;
  topic_step_id TEXT;
BEGIN
  FOR tenant_rec IN 
    SELECT DISTINCT tenant_id
    FROM public.call_steps
    WHERE workflow_name = 'Der perfekte Call' AND is_topic_step = true
    AND tenant_id NOT IN (SELECT DISTINCT tenant_id FROM public.topics)
  LOOP
    -- Get the topic step_id for this tenant
    SELECT step_id INTO topic_step_id
    FROM public.call_steps
    WHERE tenant_id = tenant_rec.tenant_id
    AND workflow_name = 'Der perfekte Call'
    AND is_topic_step = true
    LIMIT 1;
    
    IF topic_step_id IS NOT NULL THEN
      -- Create unique topics for this tenant
      INSERT INTO public.topics (id, tenant_id, step_id, name, description, icon, color, sort_order, is_active)
      VALUES 
        (gen_random_uuid(), tenant_rec.tenant_id, topic_step_id, 'Tarifwechsel', 'Kunde möchte Tarif wechseln', '🔄', '#3b82f6', 0, true),
        (gen_random_uuid(), tenant_rec.tenant_id, topic_step_id, 'Kündigung', 'Kunde möchte kündigen', '❌', '#ef4444', 1, true);
      
      -- Update sub-steps to reference these new topics
      UPDATE public.call_steps
      SET parent_topic_id = (SELECT id FROM public.topics WHERE tenant_id = tenant_rec.tenant_id AND name = 'Tarifwechsel' LIMIT 1)
      WHERE tenant_id = tenant_rec.tenant_id
      AND step_id LIKE 'substep-tarifwechsel%';
      
      UPDATE public.call_steps
      SET parent_topic_id = (SELECT id FROM public.topics WHERE tenant_id = tenant_rec.tenant_id AND name = 'Kündigung' LIMIT 1)
      WHERE tenant_id = tenant_rec.tenant_id
      AND step_id LIKE 'substep-kuendigung%';
      
      RAISE NOTICE 'Created topics for: %', tenant_rec.tenant_id;
    END IF;
  END LOOP;
END $$;