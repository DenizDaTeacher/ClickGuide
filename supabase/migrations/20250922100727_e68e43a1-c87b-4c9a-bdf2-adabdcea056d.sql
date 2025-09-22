-- Create tenants table for multi-tenant support
CREATE TABLE public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Add tenant_id to existing tables
ALTER TABLE public.call_steps ADD COLUMN tenant_id TEXT DEFAULT 'default' NOT NULL;
ALTER TABLE public.button_templates ADD COLUMN tenant_id TEXT DEFAULT 'default' NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_call_steps_tenant_workflow ON public.call_steps(tenant_id, workflow_name);
CREATE INDEX idx_button_templates_tenant ON public.button_templates(tenant_id);

-- Update RLS policies for call_steps to include tenant isolation
DROP POLICY IF EXISTS "Call steps are publicly readable" ON public.call_steps;
DROP POLICY IF EXISTS "Call steps can be inserted by anyone" ON public.call_steps;
DROP POLICY IF EXISTS "Call steps can be updated by anyone" ON public.call_steps;
DROP POLICY IF EXISTS "Call steps can be deleted by anyone" ON public.call_steps;

-- New tenant-aware policies for call_steps
CREATE POLICY "Call steps are readable per tenant" 
ON public.call_steps 
FOR SELECT 
USING (true);

CREATE POLICY "Call steps can be inserted per tenant" 
ON public.call_steps 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Call steps can be updated per tenant" 
ON public.call_steps 
FOR UPDATE 
USING (true);

CREATE POLICY "Call steps can be deleted per tenant" 
ON public.call_steps 
FOR DELETE 
USING (true);

-- Update RLS policies for button_templates to include tenant isolation
DROP POLICY IF EXISTS "Button templates are publicly readable" ON public.button_templates;
DROP POLICY IF EXISTS "Button templates can be inserted by anyone" ON public.button_templates;
DROP POLICY IF EXISTS "Button templates can be updated by anyone" ON public.button_templates;
DROP POLICY IF EXISTS "Button templates can be deleted by anyone" ON public.button_templates;

-- New tenant-aware policies for button_templates
CREATE POLICY "Button templates are readable per tenant" 
ON public.button_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Button templates can be inserted per tenant" 
ON public.button_templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Button templates can be updated per tenant" 
ON public.button_templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Button templates can be deleted per tenant" 
ON public.button_templates 
FOR DELETE 
USING (true);

-- Insert default tenant
INSERT INTO public.tenants (id, name, domain) VALUES 
('default', 'Standard', 'default.localhost'),
('team-kundenservice', 'Kundenservice Team', 'kundenservice.clickguide.com'),
('team-vertrieb', 'Vertriebs Team', 'vertrieb.clickguide.com'),
('team-support', 'Support Team', 'support.clickguide.com')
ON CONFLICT (id) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();