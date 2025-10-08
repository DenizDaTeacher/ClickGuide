-- Fix: Ensure 1&1 and all other tenants have sub-steps and topics
DO $$
DECLARE
  topic_id_tarifwechsel UUID := '451d7de1-0ec6-4b9b-942a-059c20e42a73';
  topic_id_kuendigung UUID := 'f11e096e-f201-4dff-ab5c-f45239482b6a';
  topic_step_id TEXT;
BEGIN
  -- Fix 1&1
  SELECT step_id INTO topic_step_id
  FROM public.call_steps
  WHERE tenant_id = '1&1' AND workflow_name = 'Der perfekte Call' AND is_topic_step = true;
  
  IF topic_step_id IS NOT NULL THEN
    -- Add topics for 1&1
    INSERT INTO public.topics (id, tenant_id, step_id, name, description, icon, color, sort_order, is_active)
    VALUES 
      (topic_id_tarifwechsel, '1&1', topic_step_id, 'Tarifwechsel', 'Kunde möchte Tarif wechseln', '🔄', '#3b82f6', 0, true),
      (topic_id_kuendigung, '1&1', topic_step_id, 'Kündigung', 'Kunde möchte kündigen', '❌', '#ef4444', 1, true)
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      step_id = EXCLUDED.step_id;
    
    -- Add sub-steps for 1&1
    INSERT INTO public.call_steps (
      tenant_id, workflow_name, step_id, title, description, communication,
      category, sort_order, required, step_type, parent_topic_id
    ) VALUES 
      ('1&1', 'Der perfekte Call', 'substep-tarifwechsel-1&1', 'Tarifwechsel Prozess',
       'Bearbeitung eines Tarifwechsels', 'Ich helfe Ihnen gerne beim Tarifwechsel. Welcher Tarif interessiert Sie?',
       'Anliegen', 0, false, 'sub_step', topic_id_tarifwechsel),
      ('1&1', 'Der perfekte Call', 'substep-kuendigung-1&1', 'Kündigung Prozess',
       'Bearbeitung einer Kündigung', 'Es tut mir leid, dass Sie kündigen möchten. Darf ich fragen, was der Grund ist?',
       'Anliegen', 0, false, 'sub_step', topic_id_kuendigung)
    ON CONFLICT (step_id) DO NOTHING;
  END IF;
  
  -- Fix other tenants (default, team-vertrieb, DEMO if exists)
  FOR topic_step_id IN 
    SELECT cs.step_id
    FROM public.call_steps cs
    WHERE cs.workflow_name = 'Der perfekte Call' 
    AND cs.is_topic_step = true
    AND cs.tenant_id NOT IN ('1&1', 'team-kundenservice')
  LOOP
    -- Get tenant_id from this step
    DECLARE
      curr_tenant TEXT;
    BEGIN
      SELECT tenant_id INTO curr_tenant
      FROM public.call_steps
      WHERE step_id = topic_step_id;
      
      -- Add topics if missing
      IF NOT EXISTS (SELECT 1 FROM public.topics WHERE tenant_id = curr_tenant LIMIT 1) THEN
        INSERT INTO public.topics (id, tenant_id, step_id, name, description, icon, color, sort_order, is_active)
        VALUES 
          (topic_id_tarifwechsel, curr_tenant, topic_step_id, 'Tarifwechsel', 'Kunde möchte Tarif wechseln', '🔄', '#3b82f6', 0, true),
          (topic_id_kuendigung, curr_tenant, topic_step_id, 'Kündigung', 'Kunde möchte kündigen', '❌', '#ef4444', 1, true)
        ON CONFLICT (id) DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          step_id = EXCLUDED.step_id;
      END IF;
    END;
  END LOOP;
END $$;