-- Insert ServicePlus objections and responses

-- Insert objections
INSERT INTO public.objections (tenant_id, title, description, keywords, priority) VALUES
('default', 'Zu teuer', 'Kunde findet das Angebot zu teuer', ARRAY['zu teuer', 'teuer', 'kostet viel', 'kostet zu viel'], 10),
('default', 'Keine Zeit', 'Kunde hat keine Zeit für das Gespräch', ARRAY['keine Zeit', 'keine zeit', 'zu wenig Zeit'], 9),
('default', 'Günstiger bei Konkurrenz', 'Kunde sagt, es sei günstiger bei der Konkurrenz', ARRAY['günstiger bei der Konkurrenz', 'billiger bei der Konkurrenz'], 8),
('default', 'Brauche ich nicht', 'Kunde sieht keinen Bedarf', ARRAY['brauche ich nicht', 'nicht nötig', 'kein Bedarf'], 7),
('default', 'Mit Partner besprechen', 'Kunde muss es mit Partner/Familie besprechen', ARRAY['Partner besprechen', 'muss ich mit meinem Partner besprechen', 'mit meinem Partner', 'Partner', 'Freund', 'Freundin', 'Ehemann', 'Ehefrau', 'Mann', 'Frau'], 6),
('default', 'Glaube nicht daran', 'Kunde ist skeptisch', ARRAY['glaube nicht', 'bringt nichts', 'das bringt nichts', 'bringt nix'], 5),
('default', 'Will nichts kaufen', 'Kunde lehnt Verkaufsgespräch ab', ARRAY['will nichts verkauft bekommen', 'verkauf nichts', 'will nichts kaufen', 'kaufe nichts', 'kaufe nix'], 4);

-- Get objection IDs for responses
DO $$
DECLARE
  obj_teuer uuid;
  obj_zeit uuid;
  obj_konkurrenz uuid;
  obj_bedarf uuid;
  obj_partner uuid;
  obj_skeptisch uuid;
  obj_verkauf uuid;
BEGIN
  -- Get objection IDs
  SELECT id INTO obj_teuer FROM public.objections WHERE title = 'Zu teuer' AND tenant_id = 'default';
  SELECT id INTO obj_zeit FROM public.objections WHERE title = 'Keine Zeit' AND tenant_id = 'default';
  SELECT id INTO obj_konkurrenz FROM public.objections WHERE title = 'Günstiger bei Konkurrenz' AND tenant_id = 'default';
  SELECT id INTO obj_bedarf FROM public.objections WHERE title = 'Brauche ich nicht' AND tenant_id = 'default';
  SELECT id INTO obj_partner FROM public.objections WHERE title = 'Mit Partner besprechen' AND tenant_id = 'default';
  SELECT id INTO obj_skeptisch FROM public.objections WHERE title = 'Glaube nicht daran' AND tenant_id = 'default';
  SELECT id INTO obj_verkauf FROM public.objections WHERE title = 'Will nichts kaufen' AND tenant_id = 'default';

  -- Insert responses for "Zu teuer"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_teuer, 'Verständlich! Darf ich Ihnen zeigen, was alles im Tarif enthalten ist?', 1),
  ('default', obj_teuer, 'Lassen Sie uns gemeinsam schauen, ob es noch eine passende Alternative gibt.', 2),
  ('default', obj_teuer, 'Viele Kunden waren überrascht, wie viel sie tatsächlich sparen können.', 3);

  -- Insert responses for "Keine Zeit"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_zeit, 'Verständlich, viele Kunden sind stark eingebunden. Ich fasse mich ganz kurz – es geht nur um 2 Minuten.', 1),
  ('default', obj_zeit, 'Ich verstehe, dass es manchmal schwer ist, Zeit zu finden. Darf ich Ihnen kurz zeigen, warum es sich lohnt?', 2),
  ('default', obj_zeit, 'Klingt nach einem vollen Kalender! Lassen Sie uns trotzdem kurz besprechen, wie es Ihnen helfen kann.', 3);

  -- Insert response for "Günstiger bei Konkurrenz"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_konkurrenz, 'Das kann gut sein - es gibt immer günstigere Angebote. Viele Kunden haben sich aber trotzdem für uns entschieden, weil sie gemerkt haben: Preis ist das eine, aber Leistung, Service und Verlässlichkeit zahlen sich am Ende mehr aus. Darf ich kurz zeigen, wo genau der Unterschied liegt?', 1);

  -- Insert response for "Brauche ich nicht"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_bedarf, 'Das dachte ich anfangs auch - viele unserer Kunden waren überrascht, wie hilfreich es dann doch war. Darf ich kurz fragen, was Ihnen aktuell wichtig ist? Vielleicht können wir genau das verbessern. Sie können es einfach 14 Tage unverbindlich testen.', 1);

  -- Insert response for "Mit Partner besprechen"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_partner, 'Absolut verständlich, wenn sie möchten, gebe ich Ihnen eine kurze Zusammenfassung, oder wir finden direkt einen Termin, zu dem Ihr Partner dabei sein kann. Was wäre Ihnen lieber?', 1);

  -- Insert response for "Glaube nicht daran"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_skeptisch, 'Ihre Skepsis ist nachvollziehbar. Einige unserer Kunden denken wie Sie - viele waren dann aber überrascht, wie schnell sich spürbarer Nutzen gezeigt hat. Darf ich Ihnen kurz erklären warum?', 1);

  -- Insert response for "Will nichts kaufen"
  INSERT INTO public.responses (tenant_id, objection_id, response_text, sort_order) VALUES
  ('default', obj_verkauf, 'Das verstehe ich gut - mir geht es auch nicht darum, Ihnen etwas aufzudrängen. Mein Ziel ist es, Ihnen einen kurzen Überblick zu geben, damit Sie selbst entscheiden können, ob es einen Vorteil für Sie hat. Ist das fair?', 1);
END $$;