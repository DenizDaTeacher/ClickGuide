-- Extend call_steps table to support workflow features
ALTER TABLE public.call_steps 
ADD COLUMN parent_step_id text REFERENCES public.call_steps(step_id),
ADD COLUMN step_type text NOT NULL DEFAULT 'normal',
ADD COLUMN condition_label text,
ADD COLUMN next_step_conditions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN position_x integer DEFAULT 0,
ADD COLUMN position_y integer DEFAULT 0,
ADD COLUMN is_start_step boolean DEFAULT false,
ADD COLUMN is_end_step boolean DEFAULT false;

-- Add check constraint for step_type
ALTER TABLE public.call_steps 
ADD CONSTRAINT check_step_type 
CHECK (step_type IN ('normal', 'condition', 'sub_step', 'decision'));

-- Create index for better performance
CREATE INDEX idx_call_steps_parent ON public.call_steps(parent_step_id);
CREATE INDEX idx_call_steps_type ON public.call_steps(step_type);

-- Update existing steps to be normal type
UPDATE public.call_steps SET step_type = 'normal' WHERE step_type IS NULL;