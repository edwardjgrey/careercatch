-- Career Catch Database Setup
-- Run this file with: psql "your-database-url" < setup.sql

-- Drop existing tables (be careful in production!)
DROP TABLE IF EXISTS recommendation_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS job_seeker_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('job_seeker', 'employer', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    industry VARCHAR(100),
    size VARCHAR(50),
    founded_year INTEGER,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job_seeker_profiles table
CREATE TABLE job_seeker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    skills TEXT[],
    languages TEXT[],
    experience_years INTEGER,
    current_position VARCHAR(255),
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    is_open_to_work BOOLEAN DEFAULT true,
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    preferred_categories TEXT[],
    preferred_job_types TEXT[],
    open_to_remote BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    posted_by INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    category VARCHAR(100),
    job_type VARCHAR(50) DEFAULT 'full_time',
    experience_level VARCHAR(50) DEFAULT 'mid',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    hide_salary BOOLEAN DEFAULT false,
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    is_remote BOOLEAN DEFAULT false,
    is_hybrid BOOLEAN DEFAULT false,
    skills_required TEXT[],
    languages_required TEXT[],
    education_required VARCHAR(100),
    experience_years_min INTEGER,
    experience_years_max INTEGER,
    deadline DATE,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    resume_url TEXT,
    expected_salary INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    available_from DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
    employer_notes TEXT,
    rejection_reason TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Create saved_jobs table
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Create conversations table for messaging
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recommendation_logs table for analytics
CREATE TABLE recommendation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(country, city);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Insert demo data
-- Create demo users (password is 'password123' for all)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, country, city) VALUES
('admin@careercatch.com', '$2a$10$rBYQmZHJRqCv2Q3i7VqmOu7VJwM3KKtRUOXLkYJ2CywK1hpFI/Zxm', 'admin', 'Admin', 'User', '+996555123456', 'Kyrgyzstan', 'Bishkek'),
('employer@demo.com', '$2a$10$rBYQmZHJRqCv2Q3i7VqmOu7VJwM3KKtRUOXLkYJ2CywK1hpFI/Zxm', 'employer', 'John', 'Smith', '+996555111111', 'Kyrgyzstan', 'Bishkek'),
('seeker@demo.com', '$2a$10$rBYQmZHJRqCv2Q3i7VqmOu7VJwM3KKtRUOXLkYJ2CywK1hpFI/Zxm', 'job_seeker', 'Jane', 'Doe', '+996555222222', 'Kyrgyzstan', 'Bishkek'),
('employer2@demo.com', '$2a$10$rBYQmZHJRqCv2Q3i7VqmOu7VJwM3KKtRUOXLkYJ2CywK1hpFI/Zxm', 'employer', 'Mike', 'Johnson', '+7777123456', 'Kazakhstan', 'Almaty'),
('seeker2@demo.com', '$2a$10$rBYQmZHJRqCv2Q3i7VqmOu7VJwM3KKtRUOXLkYJ2CywK1hpFI/Zxm', 'job_seeker', 'Sarah', 'Williams', '+998901234567', 'Uzbekistan', 'Tashkent');

-- Create demo companies
INSERT INTO companies (user_id, name, slug, description, industry, size, country, city, website) VALUES
(2, 'TechCorp Central Asia', 'techcorp-central-asia', 'Leading technology company in Central Asia', 'Technology', '51-200', 'Kyrgyzstan', 'Bishkek', 'https://techcorp.kg'),
(4, 'KazInnovate', 'kazinnovate', 'Innovation and consulting firm', 'Consulting', '11-50', 'Kazakhstan', 'Almaty', 'https://kazinnovate.kz');

-- Create demo job seeker profiles
INSERT INTO job_seeker_profiles (user_id, headline, summary, skills, languages, experience_years, is_open_to_work) VALUES
(3, 'Full Stack Developer', 'Experienced developer with 5 years in web development', ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL'], ARRAY['English', 'Russian', 'Kyrgyz'], 5, true),
(5, 'UI/UX Designer', 'Creative designer specializing in mobile and web interfaces', ARRAY['Figma', 'Sketch', 'Adobe XD', 'CSS'], ARRAY['English', 'Uzbek', 'Russian'], 3, true);

-- Create demo jobs
INSERT INTO jobs (company_id, posted_by, title, slug, description, requirements, category, job_type, experience_level, salary_min, salary_max, salary_currency, country, city, is_remote, skills_required) VALUES
(1, 2, 'Senior Frontend Developer', 'senior-frontend-developer-1', 'We are looking for an experienced frontend developer to join our team.', '5+ years of React experience required', 'Technology & IT', 'full_time', 'senior', 2000, 4000, 'USD', 'Kyrgyzstan', 'Bishkek', false, ARRAY['React', 'TypeScript', 'CSS']),
(1, 2, 'DevOps Engineer', 'devops-engineer-1', 'Seeking a DevOps engineer to manage our cloud infrastructure.', 'Experience with AWS and Docker required', 'Technology & IT', 'full_time', 'mid', 1500, 3000, 'USD', 'Kyrgyzstan', 'Bishkek', true, ARRAY['AWS', 'Docker', 'Kubernetes']),
(2, 4, 'Business Analyst', 'business-analyst-1', 'Join our team as a Business Analyst to help drive strategic initiatives.', '3+ years of business analysis experience', 'Business & Finance', 'full_time', 'mid', 1000, 2000, 'USD', 'Kazakhstan', 'Almaty', false, ARRAY['Excel', 'SQL', 'PowerBI']),
(2, 4, 'Marketing Manager', 'marketing-manager-1', 'Lead our marketing efforts across Central Asia.', 'Experience in digital marketing required', 'Sales & Marketing', 'full_time', 'senior', 1200, 2500, 'USD', 'Kazakhstan', 'Almaty', false, ARRAY['SEO', 'SEM', 'Social Media']);

-- Create demo applications
INSERT INTO applications (job_id, user_id, company_id, cover_letter, expected_salary, status) VALUES
(1, 3, 1, 'I am very interested in this position and believe my skills match your requirements perfectly.', 3000, 'pending'),
(3, 5, 2, 'My experience in data visualization would be valuable for this role.', 1500, 'reviewed');

-- Create demo saved jobs
INSERT INTO saved_jobs (user_id, job_id) VALUES
(3, 2),
(3, 4),
(5, 1),
(5, 3);

-- Display success message
SELECT 'Database setup completed successfully!' as message;