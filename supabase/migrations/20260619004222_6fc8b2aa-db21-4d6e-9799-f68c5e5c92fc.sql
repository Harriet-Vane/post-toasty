CREATE POLICY "Authenticated users can upload toast cards"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'toast-cards');

CREATE POLICY "Authenticated users can update own toast cards"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'toast-cards' AND owner = auth.uid());

CREATE POLICY "Authenticated users can delete own toast cards"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'toast-cards' AND owner = auth.uid());

CREATE POLICY "Public can read toast cards"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'toast-cards');