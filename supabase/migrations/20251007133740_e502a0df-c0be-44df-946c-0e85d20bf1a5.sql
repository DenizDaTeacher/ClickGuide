-- Delete the "Gesprächsleitfaden" workflow from all tenants
DELETE FROM public.call_steps 
WHERE workflow_name = 'Gesprächsleitfaden';

-- Update "Der perfekte Call" template to be the default
UPDATE public.workflow_templates 
SET is_default = true 
WHERE name = 'Der perfekte Call';