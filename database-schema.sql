-- TaskMaster Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color codes
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT categories_name_length CHECK (LENGTH(name) >= 1),
    CONSTRAINT categories_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tasks_title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 255),
    CONSTRAINT tasks_description_length CHECK (description IS NULL OR LENGTH(description) <= 1000)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Tasks RLS Policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Categories RLS Policies
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for task statistics (optional)
CREATE OR REPLACE VIEW task_stats AS
SELECT 
    user_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE completed = true) as completed_tasks,
    COUNT(*) FILTER (WHERE completed = false) as pending_tasks,
    COUNT(*) FILTER (WHERE completed = false AND due_date < NOW()) as overdue_tasks,
    ROUND(
        (COUNT(*) FILTER (WHERE completed = true)::float / COUNT(*)) * 100, 
        2
    ) as completion_rate
FROM tasks
GROUP BY user_id;

-- Grant necessary permissions
GRANT SELECT ON task_stats TO authenticated;

-- Insert some default categories (optional)
-- These will be created for demonstration, but in production you might want users to create their own
-- INSERT INTO categories (name, color, user_id) VALUES
-- ('Work', '#3B82F6', auth.uid()),
-- ('Personal', '#10B981', auth.uid()),
-- ('Urgent', '#EF4444', auth.uid())
-- WHERE auth.uid() IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE tasks IS 'User tasks with priority, due dates, and categories';
COMMENT ON TABLE categories IS 'User-defined categories for organizing tasks';
COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, or high';
COMMENT ON COLUMN tasks.due_date IS 'Optional due date for the task';
COMMENT ON COLUMN categories.color IS 'Hex color code for category display';
