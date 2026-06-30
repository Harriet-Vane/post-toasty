DROP POLICY IF EXISTS "Anon can upload toast cards" ON storage.objects;
DROP POLICY IF EXISTS "Anon can update toast cards" ON storage.objects;
CREATE POLICY "Public can upload toast cards" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'toast-cards');
CREATE POLICY "Public can update toast cards" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'toast-cards') WITH CHECK (bucket_id = 'toast-cards');
CREATE POLICY "Public can read toast cards" ON storage.objects FOR SELECT TO public USING (bucket_id = 'toast-cards');