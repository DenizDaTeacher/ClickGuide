-- Delete duplicate objections, keep only the first one of each type
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY title, tenant_id ORDER BY created_at) as rn
  FROM public.objections
  WHERE tenant_id = 'default'
)
DELETE FROM public.objections
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Delete responses that belong to deleted objections
DELETE FROM public.responses
WHERE objection_id NOT IN (SELECT id FROM public.objections);