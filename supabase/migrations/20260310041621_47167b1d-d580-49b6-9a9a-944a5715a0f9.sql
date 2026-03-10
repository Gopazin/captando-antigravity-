-- Create storage bucket for project documents (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-documents', 'project-documents', false, 20971520, ARRAY['application/pdf']);

-- Allow anyone to upload to project-documents bucket
CREATE POLICY "Anyone can upload project documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'project-documents');

-- Allow anyone to read project documents
CREATE POLICY "Anyone can read project documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-documents');