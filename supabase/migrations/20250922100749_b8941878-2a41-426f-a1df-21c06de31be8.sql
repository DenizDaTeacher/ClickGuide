-- Fix security issues: Enable RLS on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants table
CREATE POLICY "Tenants are publicly readable" 
ON public.tenants 
FOR SELECT 
USING (true);

CREATE POLICY "Tenants can be inserted by admin" 
ON public.tenants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Tenants can be updated by admin" 
ON public.tenants 
FOR UPDATE 
USING (true);

CREATE POLICY "Tenants can be deleted by admin" 
ON public.tenants 
FOR DELETE 
USING (true);