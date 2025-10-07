-- Remove duplicate responses, keeping only the first one of each response_text per objection
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY objection_id, response_text ORDER BY created_at) as rn
  FROM public.responses
  WHERE tenant_id = 'default'
)
DELETE FROM public.responses
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);