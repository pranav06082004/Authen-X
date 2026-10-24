-- Access rules for the analysis-media bucket
-- Users may upload into their own folder (named after their user id);
-- anyone can view files because the bucket is public.

CREATE POLICY "Allow public read access to analysis-media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'analysis-media');

CREATE POLICY "Allow authenticated users to upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analysis-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'analysis-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'analysis-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'analysis-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);