-- Insert topics for "Kundenanliegen bearbeiten" using step_id (text), not uuid
INSERT INTO public.topics (tenant_id, step_id, name, description, icon, color, sort_order, is_active) 
VALUES
('1&1', '1&1_demo_7_1759837084651_qyn4c7hds', 'Tarifwechsel', 'Kunde möchte seinen Tarif wechseln oder ändern', '🔄', '#3B82F6', 1, true),
('1&1', '1&1_demo_7_1759837084651_qyn4c7hds', 'Kündigung', 'Kunde möchte seinen Vertrag kündigen', '❌', '#EF4444', 2, true);