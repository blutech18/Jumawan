-- Create a comprehensive migration file that runs all migrations in order
-- This file can be used to set up the entire database schema

-- Run all migrations in sequence
\i migrations/001_create_helpers.sql
\i migrations/002_create_projects.sql
\i migrations/003_create_certificates.sql
\i migrations/004_create_contact_messages.sql
\i migrations/005_create_analytics.sql
\i migrations/006_create_storage_bucket.sql
\i migrations/007_fix_storage_rls.sql

-- Insert some sample data for testing
INSERT INTO projects (title, description, image_url, live_url, github_url, technologies, featured, order_index) VALUES
('Sample Project 1', 'This is a sample project description', 'https://picsum.photos/400/300?random=1', 'https://example.com', 'https://github.com/example', ARRAY['React', 'TypeScript', 'Tailwind'], true, 1),
('Sample Project 2', 'Another sample project description', 'https://picsum.photos/400/300?random=2', 'https://example2.com', 'https://github.com/example2', ARRAY['Vue', 'Node.js', 'MongoDB'], false, 2)
ON CONFLICT DO NOTHING;

INSERT INTO certificates (title, issuer, issue_date, credential_id, credential_url, image_url, description, order_index) VALUES
('Sample Certificate 1', 'Sample Issuer', '2024-01-15', 'CERT-001', 'https://example.com/cert', 'https://picsum.photos/300/200?random=3', 'Sample certificate description', 1),
('Sample Certificate 2', 'Another Issuer', '2024-02-20', 'CERT-002', 'https://example.com/cert2', 'https://picsum.photos/300/200?random=4', 'Another certificate description', 2)
ON CONFLICT DO NOTHING;
