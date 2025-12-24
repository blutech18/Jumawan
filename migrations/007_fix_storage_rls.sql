-- Adjust storage RLS to support admin UI uploads without Supabase Auth session
-- Allows anonymous uploads only to specific folders under the public 'images' bucket

-- Ensure bucket exists and is public (no-op if already created)
INSERT INTO storage.buckets (id, name, public)
SELECT 'images', 'images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- Policy: Allow anonymous insert into 'images' bucket for whitelisted folder prefixes
-- Folders: 'projects/', 'certificates/', 'profile/'
DROP POLICY IF EXISTS "Anonymous limited uploads for images" ON storage.objects;
CREATE POLICY "Anonymous limited uploads for images" ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'images'
  AND (
    name LIKE 'projects/%' OR
    name LIKE 'certificates/%' OR
    name LIKE 'profile/%'
  )
);

-- Keep existing authenticated policies for update/delete
-- Also allow anon to select (public read handled by existing policy)
-- No change needed for SELECT as bucket is public with SELECT policy already.

