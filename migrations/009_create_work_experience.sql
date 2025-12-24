-- Create work_experience table for managing work experience entries
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS work_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract')),
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    duration VARCHAR(100),
    achievements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    team_size VARCHAR(100),
    company_size VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for work_experience
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_work_experience_updated_at ON work_experience;
        CREATE TRIGGER update_work_experience_updated_at 
            BEFORE UPDATE ON work_experience 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_experience_current ON work_experience(current);
CREATE INDEX IF NOT EXISTS idx_work_experience_order ON work_experience(order_index);
CREATE INDEX IF NOT EXISTS idx_work_experience_start_date ON work_experience(start_date);
CREATE INDEX IF NOT EXISTS idx_work_experience_created_at ON work_experience(created_at);

-- Enable Row Level Security
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow public read access
DROP POLICY IF EXISTS "Public read access for work_experience" ON work_experience;
CREATE POLICY "Public read access for work_experience" ON work_experience
    FOR SELECT USING (true);

-- Insert sample data (optional - can be removed)
INSERT INTO work_experience (
    company, position, type, location, start_date, end_date, current, duration,
    achievements, responsibilities, technologies, team_size, company_size, order_index
) VALUES (
    'Self-Employed',
    'Freelance Software Developer',
    'Freelance',
    'Remote',
    '2024-01-01',
    NULL,
    true,
    '1+ year',
    ARRAY[
        'Developed web and mobile applications for multiple clients',
        'Built full-stack solutions using Laravel, Next.js, React Native, Python, Kotlin, and JavaScript',
        'Successfully converted client requirements into functional and maintainable software'
    ],
    ARRAY[
        'Developed web and mobile applications for multiple clients',
        'Built full-stack solutions using Laravel, Next.js, React Native, Python, Kotlin, and JavaScript',
        'Implemented APIs, authentication, database integration, and responsive user interfaces',
        'Converted client requirements into functional and maintainable software',
        'Fixed bugs, added features, and provided technical support after delivery',
        'Ensured code quality and maintainability across all projects'
    ],
    ARRAY['Laravel', 'Next.js', 'React Native', 'Python', 'Kotlin', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Firebase', 'MySQL', 'Supabase'],
    'Solo contractor',
    'Self-employed',
    1
) ON CONFLICT DO NOTHING;

