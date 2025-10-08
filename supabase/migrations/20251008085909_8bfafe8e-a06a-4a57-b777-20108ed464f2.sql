-- Fix: Change topics.step_id to reference call_steps.id (UUID)

-- Step 1: Add a new column for the UUID reference
ALTER TABLE public.topics ADD COLUMN step_uuid uuid;

-- Step 2: Populate the new column with the correct step UUID based on tenant_id and workflow
UPDATE public.topics t
SET step_uuid = cs.id
FROM public.call_steps cs
WHERE cs.tenant_id = t.tenant_id 
AND cs.workflow_name = 'Der perfekte Call' 
AND cs.is_topic_step = true;

-- Step 3: Drop the old step_id column and its constraint
ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_step_id_fkey;
ALTER TABLE public.topics DROP COLUMN step_id;

-- Step 4: Rename the new column to step_id
ALTER TABLE public.topics RENAME COLUMN step_uuid TO step_id;

-- Step 5: Add the foreign key constraint
ALTER TABLE public.topics 
ADD CONSTRAINT topics_step_id_fkey 
FOREIGN KEY (step_id) REFERENCES public.call_steps(id) ON DELETE CASCADE;