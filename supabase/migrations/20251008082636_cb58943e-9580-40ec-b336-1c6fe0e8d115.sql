-- Recreate topics and sub-steps for all tenants
DO $$
DECLARE
  topic_id_tarifwechsel UUID := '451d7de1-0ec6-4b9b-942a-059c20e42a73';
  topic_id_kuendigung UUID := 'f11e096e-f201-4dff-ab5c-f45239482b6a';
  tenant_rec RECORD;
  topic_step_id TEXT;
BEGIN
  FOR tenant_rec IN 
    SELECT DISTINCT id 
    FROM public.tenants 
    WHERE is_active = true
  LOOP
    -- Get the step_id of the topic step for this tenant
    SELECT step_id INTO topic_step_id
    FROM public.call_steps
    WHERE tenant_id = tenant_rec.id
    AND workflow_name = 'Der perfekte Call'
    AND is_topic_step = true
    LIMIT 1;
    
    IF topic_step_id IS NULL THEN
      RAISE NOTICE 'No topic step found for tenant: %', tenant_rec.id;
      CONTINUE;
    END IF;
    
    -- Insert topics
    INSERT INTO public.topics (id, tenant_id, step_id, name, description, icon, color, sort_order, is_active)
    VALUES 
      (topic_id_tarifwechsel, tenant_rec.id, topic_step_id, 'Tarifwechsel', 'Kunde möchte Tarif wechseln', '🔄', '#3b82f6', 0, true),
      (topic_id_kuendigung, tenant_rec.id, topic_step_id, 'Kündigung', 'Kunde möchte kündigen', '❌', '#ef4444', 1, true)
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      step_id = EXCLUDED.step_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      color = EXCLUDED.color;
    
    -- Insert sub-steps for Tarifwechsel
    INSERT INTO public.call_steps (
      tenant_id, workflow_name, step_id, title, description, communication,
      category, sort_order, required, step_type, parent_topic_id
    ) VALUES (
      tenant_rec.id,
      'Der perfekte Call',
      'substep-tarifwechsel-' || tenant_rec.id,
      'Tarifwechsel Prozess',
      'Bearbeitung eines Tarifwechsels',
      'Ich helfe Ihnen gerne beim Tarifwechsel. Welcher Tarif interessiert Sie?',
      'Anliegen',
      0,
      false,
      'sub_step',
      topic_id_tarifwechsel
    ) ON CONFLICT (step_id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      parent_topic_id = EXCLUDED.parent_topic_id;
    
    -- Insert sub-steps for Kündigung  
    INSERT INTO public.call_steps (
      tenant_id, workflow_name, step_id, title, description, communication,
      category, sort_order, required, step_type, parent_topic_id
    ) VALUES (
      tenant_rec.id,
      'Der perfekte Call',
      'substep-kuendigung-' || tenant_rec.id,
      'Kündigung Prozess',
      'Bearbeitung einer Kündigung',
      'Es tut mir leid, dass Sie kündigen möchten. Darf ich fragen, was der Grund ist?',
      'Anliegen',
      0,
      false,
      'sub_step',
      topic_id_kuendigung
    ) ON CONFLICT (step_id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      parent_topic_id = EXCLUDED.parent_topic_id;
    
    RAISE NOTICE 'Created topics and sub-steps for: %', tenant_rec.id;
  END LOOP;
END $$;