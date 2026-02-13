-- ============================================
-- Tools Table Migration
-- ============================================

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    ring VARCHAR(20) NOT NULL CHECK (ring IN ('inner', 'outer')),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for tools
DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_ring ON tools(ring);
CREATE INDEX IF NOT EXISTS idx_tools_order ON tools(order_index);
CREATE INDEX IF NOT EXISTS idx_tools_is_active ON tools(is_active);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at);

-- Enable Row Level Security
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow public read access for active tools
DROP POLICY IF EXISTS "Public read access for tools" ON tools;
CREATE POLICY "Public read access for tools" ON tools
    FOR SELECT USING (true);

-- Create policy: Allow authenticated users to insert tools
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON tools;
CREATE POLICY "Authenticated users can insert tools" ON tools
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Create policy: Allow authenticated users to update tools
DROP POLICY IF EXISTS "Authenticated users can update tools" ON tools;
CREATE POLICY "Authenticated users can update tools" ON tools
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy: Allow authenticated users to delete tools
DROP POLICY IF EXISTS "Authenticated users can delete tools" ON tools;
CREATE POLICY "Authenticated users can delete tools" ON tools
    FOR DELETE 
    TO authenticated
    USING (true);

-- Insert some sample tools (optional - remove if not needed)
INSERT INTO tools (name, icon_url, category, description, ring, order_index, is_active) VALUES
    ('Visual Studio Code', '/vscode.png', 'development', 'Code editor', 'inner', 1, true),
    ('GitHub', '/github.png', 'version-control', 'Version control platform', 'inner', 2, true),
    ('Firebase', '/firebase.png', 'backend', 'Backend platform', 'outer', 3, true),
    ('Supabase', '/supabase.png', 'backend', 'Backend platform', 'inner', 4, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Migration Complete!
-- ============================================
