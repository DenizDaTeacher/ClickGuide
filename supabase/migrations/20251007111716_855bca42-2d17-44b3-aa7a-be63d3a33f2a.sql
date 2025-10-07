-- Mark "Gesprächsabschluss" as end step so the workflow ends there
UPDATE call_steps 
SET is_end_step = true 
WHERE step_id = 'gespr_chsschritte_demo_9_1759829126973' 
AND tenant_id = 'DEMO';