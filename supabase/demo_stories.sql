-- Insertion de quelques stories de test pour vérifier le design

INSERT INTO public.story_groups (id, title, cover_image_url, is_active, sort_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Le Mercato', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop', true, 1),
  ('22222222-2222-2222-2222-222222222222', 'LDC', 'https://images.unsplash.com/photo-1614605051940-058b76be8628?q=80&w=400&auto=format&fit=crop', true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Classico', 'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=400&auto=format&fit=crop', true, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stories (id, group_id, media_type, media_url, title, body_text, link_url, sort_order)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'image', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop', 'Gros transfert cet été', 'Un joueur vedette de PL pourrait rejoindre le Real Madrid pour la modique somme de 120M€.', 'https://kvkfootball.com/news', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'image', 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop', 'Le PSG sur un attaquant', 'Des rumeurs envoient un nouvel attaquant.', NULL, 2),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'image', 'https://images.unsplash.com/photo-1551280857-2b9ebfca09b7?q=80&w=800&auto=format&fit=crop', 'Tirage LDC au sort', 'Des gros chocs en perspective pour les huitièmes de finale.', NULL, 1)
ON CONFLICT DO NOTHING;
