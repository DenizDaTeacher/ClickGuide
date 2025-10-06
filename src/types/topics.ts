export interface Topic {
  id: string;
  tenant_id: string;
  step_id?: string; // Reference to the parent step
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Objection {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  keywords: string[];
  category?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: string;
  objection_id?: string;
  tenant_id: string;
  response_text: string;
  follow_up_steps: Array<{
    title: string;
    description: string;
  }>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ObjectionWithResponses extends Objection {
  responses: Response[];
}
