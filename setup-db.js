// quick-setup-db.js - Quick database setup
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Creating database tables...');
  
  try {
    // Create tables
    await pool.query(`
      -- Drop existing tables if any
      DROP TABLE IF EXISTS saved_jobs CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS jobs CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS job_seeker_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- Drop types if they exist
      DROP TYPE IF EXISTS user_role CASCADE;
      DROP TYPE IF EXISTS job_type CASCADE;
      DROP TYPE IF EXISTS experience_level CASCADE;
      DROP TYPE IF EXISTS application_status CASCADE;
      
      -- Create types
      CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
      CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
      CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');
      CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
      
      -- Users table
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'job_seeker',
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
      
      -- Job seeker profiles
      CREATE TABLE job_seeker_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        headline VARCHAR(255),
        summary TEXT,
        resume_url TEXT,
        skills TEXT[],
        languages TEXT[],
        experience_years INTEGER,
        education_level VARCHAR(100),
        current_position VARCHAR(255),
        desired_salary_min INTEGER,
        desired_salary_max INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        is_open_to_work BOOLEAN DEFAULT true,
        linkedin_url TEXT,
        github_url TEXT,
        portfolio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Companies table
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
        industry VARCHAR(100),
        size VARCHAR(50),
        founded_year INTEGER,
        country VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        linkedin_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Jobs table
      CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        responsibilities TEXT,
        benefits TEXT,
        category VARCHAR(100),
        job_type job_type NOT NULL DEFAULT 'full_time',
        experience_level experience_level DEFAULT 'mid',
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        hide_salary BOOLEAN DEFAULT false,
        country VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT,
        is_remote BOOLEAN DEFAULT false,
        is_hybrid BOOLEAN DEFAULT false,
        skills_required TEXT[],
        languages_required TEXT[],
        education_required VARCHAR(100),
        experience_years_min INTEGER,
        experience_years_max INTEGER,
        application_email VARCHAR(255),
        application_url TEXT,
        views_count INTEGER DEFAULT 0,
        applications_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, slug)
      );
      
      -- Applications table
      CREATE TABLE applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url TEXT,
        expected_salary INTEGER,
        salary_currency VARCHAR(10) DEFAULT 'USD',
        available_from DATE,
        status application_status DEFAULT 'pending',
        employer_notes TEXT,
        rejection_reason TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, user_id)
      );
      
      -- Saved jobs table
      CREATE TABLE saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id)
      );
    `);
    
    console.log('✅ Tables created successfully!');
    
    // Create demo users
    console.log('👤 Creating demo users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create job seeker
    const seekerResult = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, country, city)
      VALUES ($1, $2, 'job_seeker', 'Demo', 'Seeker', 'Kazakhstan', 'Almaty')
      RETURNING id
    `, ['seeker@demo.com', hashedPassword]);
    
    await pool.query(`
      INSERT INTO job_seeker_profiles (user_id, is_open_to_work)
      VALUES ($1, true)
    `, [seekerResult.rows[0].id]);
    
    // Create employer
    const employerResult = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, country, city)
      VALUES ($1, $2, 'employer', 'Demo', 'Employer', 'Kazakhstan', 'Almaty')
      RETURNING id
    `, ['employer@demo.com', hashedPassword]);
    
    await pool.query(`
      INSERT INTO companies (user_id, name, slug, description, industry, size, country, city)
      VALUES ($1, 'Demo Tech Company', 'demo-tech-company', 
              'A demo company for testing', 'Technology', '11-50', 'Kazakhstan', 'Almaty')
      RETURNING id
    `, [employerResult.rows[0].id]);
    
    // Create admin
    await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, country, city)
      VALUES ($1, $2, 'admin', 'Admin', 'User', 'Kyrgyzstan', 'Bishkek')
    `, ['admin@careercatch.com', hashedPassword]);
    
    console.log('✅ Demo users created!');
    
    // Add sample jobs
    console.log('💼 Creating sample jobs...');
    const companyResult = await pool.query(`SELECT id FROM companies LIMIT 1`);
    if (companyResult.rows.length > 0) {
      const companyId = companyResult.rows[0].id;
      
      await pool.query(`
        INSERT INTO jobs (company_id, posted_by, title, slug, description, category, 
                         job_type, salary_min, salary_max, country, city, is_active)
        VALUES 
          ($1, $2, 'Senior Full Stack Developer', 'senior-full-stack-dev-1', 
           'We are looking for an experienced full stack developer to join our team.', 
           'Technology & IT', 'full_time', 2000, 4000, 'Kazakhstan', 'Almaty', true),
          
          ($1, $2, 'Marketing Manager', 'marketing-manager-1', 
           'Seeking a creative marketing manager to lead our campaigns.', 
           'Sales & Marketing', 'full_time', 1500, 2500, 'Kazakhstan', 'Almaty', true),
          
          ($1, $2, 'Junior Frontend Developer', 'junior-frontend-dev-1', 
           'Great opportunity for a junior developer to grow with us.', 
           'Technology & IT', 'full_time', 800, 1200, 'Kyrgyzstan', 'Bishkek', true)
      `, [companyId, employerResult.rows[0].id]);
      
      console.log('✅ Sample jobs created!');
    }
    
    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const jobCount = await pool.query('SELECT COUNT(*) FROM jobs');
    
    console.log('\n📊 Database Setup Complete:');
    console.log(`- Users created: ${userCount.rows[0].count}`);
    console.log(`- Jobs created: ${jobCount.rows[0].count}`);
    console.log('\n🔐 Login Credentials:');
    console.log('  Job Seeker: seeker@demo.com / password123');
    console.log('  Employer: employer@demo.com / password123');
    console.log('  Admin: admin@careercatch.com / password123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();