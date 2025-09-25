
-- VOFMUN Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('delegate', 'chair', 'admin')),
    
    -- Basic Information
    school VARCHAR(255),
    grade VARCHAR(50),
    
    -- Role-specific data stored as JSON
    delegate_data JSONB,
    chair_data JSONB,
    admin_data JSONB,
    
    -- Common fields
    dietary_restrictions TEXT,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    
    -- Agreement flags
    agree_terms BOOLEAN NOT NULL DEFAULT FALSE,
    agree_photos BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected', 'confirmed')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create an index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create an index on registration_status
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO users (
    email, 
    first_name, 
    last_name, 
    phone, 
    role, 
    school, 
    grade, 
    emergency_contact_name, 
    emergency_contact_phone, 
    agree_terms,
    delegate_data
) VALUES (
    'test@example.com',
    'John',
    'Doe',
    '+1234567890',
    'delegate',
    'Test High School',
    '11',
    'Jane Doe',
    '+0987654321',
    true,
    '{"experience": "beginner", "committee1": "UNSC", "committee2": "GA1"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Verify the table was created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Show current table contents
SELECT COUNT(*) as total_users FROM users;
