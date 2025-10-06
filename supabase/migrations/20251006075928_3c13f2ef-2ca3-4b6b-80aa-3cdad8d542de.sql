-- Create Topics (Anliegen) table
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'default',
  name text NOT NULL,
  description text,
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create Objections (Einwände) table
CREATE TABLE IF NOT EXISTS public.objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'default',
  title text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  category text,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create Responses (Antwortbausteine) table
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objection_id uuid REFERENCES public.objections(id) ON DELETE CASCADE,
  tenant_id text NOT NULL DEFAULT 'default',
  response_text text NOT NULL,
  follow_up_steps jsonb DEFAULT '[]',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add topic_id to call_steps to link steps to topics
ALTER TABLE public.call_steps 
ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics
CREATE POLICY "Topics are readable per tenant"
  ON public.topics FOR SELECT
  USING (true);

CREATE POLICY "Topics can be inserted per tenant"
  ON public.topics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Topics can be updated per tenant"
  ON public.topics FOR UPDATE
  USING (true);

CREATE POLICY "Topics can be deleted per tenant"
  ON public.topics FOR DELETE
  USING (true);

-- RLS Policies for objections
CREATE POLICY "Objections are readable per tenant"
  ON public.objections FOR SELECT
  USING (true);

CREATE POLICY "Objections can be inserted per tenant"
  ON public.objections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Objections can be updated per tenant"
  ON public.objections FOR UPDATE
  USING (true);

CREATE POLICY "Objections can be deleted per tenant"
  ON public.objections FOR DELETE
  USING (true);

-- RLS Policies for responses
CREATE POLICY "Responses are readable per tenant"
  ON public.responses FOR SELECT
  USING (true);

CREATE POLICY "Responses can be inserted per tenant"
  ON public.responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Responses can be updated per tenant"
  ON public.responses FOR UPDATE
  USING (true);

CREATE POLICY "Responses can be deleted per tenant"
  ON public.responses FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_steps_topic_id ON public.call_steps(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_tenant_id ON public.topics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_objections_tenant_id ON public.objections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_responses_objection_id ON public.responses(objection_id);
CREATE INDEX IF NOT EXISTS idx_responses_tenant_id ON public.responses(tenant_id);

-- Add triggers for updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objections_updated_at
  BEFORE UPDATE ON public.objections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON public.responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();