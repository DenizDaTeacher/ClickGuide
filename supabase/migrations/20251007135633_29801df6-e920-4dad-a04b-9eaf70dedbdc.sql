-- Delete all steps with workflow_name "Gesprächsschritte" from all tenants
DELETE FROM public.call_steps 
WHERE workflow_name = 'Gesprächsschritte';