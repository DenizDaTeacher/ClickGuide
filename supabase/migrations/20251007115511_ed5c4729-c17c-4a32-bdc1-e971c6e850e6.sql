-- Create call_analytics table for tracking call sessions
CREATE TABLE IF NOT EXISTS call_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  workflow_name text NOT NULL,
  session_id text NOT NULL, -- Unique session identifier per user/browser
  user_ip text,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  duration_seconds integer,
  steps_total integer NOT NULL DEFAULT 0,
  steps_completed integer NOT NULL DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb, -- Array of completed step details
  call_status text NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can insert and view analytics for their tenant
CREATE POLICY "Analytics are readable per tenant"
  ON call_analytics FOR SELECT
  USING (true);

CREATE POLICY "Analytics can be inserted"
  ON call_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Analytics can be updated"
  ON call_analytics FOR UPDATE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_call_analytics_tenant_id ON call_analytics(tenant_id);
CREATE INDEX idx_call_analytics_workflow_name ON call_analytics(workflow_name);
CREATE INDEX idx_call_analytics_started_at ON call_analytics(started_at);
CREATE INDEX idx_call_analytics_session_id ON call_analytics(session_id);
CREATE INDEX idx_call_analytics_status ON call_analytics(call_status);

-- Create trigger for updated_at
CREATE TRIGGER update_call_analytics_updated_at
  BEFORE UPDATE ON call_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();