INSERT INTO services (id, name, slug, description, sort_order) VALUES
  ('editorial', 'Editorial', 'editorial', 'Sesiones editoriales y revistas', 1),
  ('comercial', 'Comercial', 'comercial', 'Publicidad y campañas de marca', 2),
  ('pasarela', 'Pasarela', 'pasarela', 'Desfiles y eventos de moda', 3),
  ('vip', 'VIP', 'vip', 'Producciones premium y eventos exclusivos', 4),
  ('fotografia', 'Fotografía', 'fotografia', 'Sesiones fotográficas profesionales', 5),
  ('video', 'Video', 'video', 'Spots, reels y contenido audiovisual', 6);

INSERT INTO models (id, name, label, category, image_key, accent, active, sort_order) VALUES
  ('zara', 'Zara', 'Chilena', 'VIP', 'models/zara.jpg', 'from-amber-700/90 to-stone-900', 1, 1),
  ('europa', 'Europa', 'Chilena', 'Editorial', 'models/europa.jpg', 'from-emerald-800/90 to-stone-900', 1, 2),
  ('issi', 'Issi', 'Chilena', 'Pasarela', 'models/issi.jpg', 'from-sky-800/90 to-stone-900', 1, 3),
  ('valentina', 'Valentina', 'Chilena', 'VIP', 'models/valentina.jpg', 'from-rose-900/90 to-stone-900', 1, 4),
  ('mellek', 'Mellek', 'Chilena', 'Comercial', 'models/mellek.jpg', 'from-violet-900/90 to-stone-900', 1, 5),
  ('priscila', 'Priscila', 'Chilena', 'Editorial', 'models/priscila.jpg', 'from-lime-900/90 to-stone-900', 1, 6),
  ('michelle', 'Michelle', 'Chilena', 'VIP', 'models/michelle.jpg', 'from-orange-900/90 to-stone-900', 1, 7),
  ('sofia', 'Sofía', 'Chilena', 'Comercial', 'models/sofia.jpg', 'from-teal-900/90 to-stone-900', 1, 8);

INSERT INTO model_services (model_id, service_id) VALUES
  ('zara', 'vip'), ('zara', 'fotografia'), ('zara', 'comercial'),
  ('europa', 'editorial'), ('europa', 'fotografia'),
  ('issi', 'pasarela'), ('issi', 'comercial'),
  ('valentina', 'vip'), ('valentina', 'editorial'), ('valentina', 'video'),
  ('mellek', 'comercial'), ('mellek', 'video'),
  ('priscila', 'editorial'), ('priscila', 'fotografia'),
  ('michelle', 'vip'), ('michelle', 'pasarela'),
  ('sofia', 'comercial'), ('sofia', 'fotografia');
