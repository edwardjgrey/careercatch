// verify-users.js - Verify and create demo users if needed
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyAndCreateUsers() {
  console.log('🔍 Checking demo users...');
  
  try {
    // Check if demo users exist
    const checkUsers = await pool.query(`
      SELECT email, role FROM users 
      WHERE email IN ('seeker@demo.com', 'employer@demo.com', 'admin@careercatch.com')
    `);
    
    console.log(`Found ${checkUsers.rows.length} demo users`);
    checkUsers.rows.forEach(user => {
      console.log(`✓ ${user.email} (${user.role})`);
    });

    // Create missing demo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check and create job seeker
    const seekerExists = checkUsers.rows.some(u => u.email === 'seeker@demo.com');
    if (!seekerExists) {
      console.log('Creating job seeker demo account...');
      const seekerResult = await pool.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, country, city, is_active)
        VALUES ($1, $2, 'job_seeker', 'Demo', 'Seeker', 'Kazakhstan', 'Almaty', true)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, ['seeker@demo.com', hashedPassword]);
      
      if (seekerResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO job_seeker_profiles (user_id, is_open_to_work)
          VALUES ($1, true)
          ON CONFLICT (user_id) DO NOTHING
        `, [seekerResult.rows[0].id]);
        console.log('✅ Created seeker@demo.com');
      }
    }

    // Check and create employer
    const employerExists = checkUsers.rows.some(u => u.email === 'employer@demo.com');
    if (!employerExists) {
      console.log('Creating employer demo account...');
      const employerResult = await pool.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, country, city, is_active)
        VALUES ($1, $2, 'employer', 'Demo', 'Employer', 'Kazakhstan', 'Almaty', true)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, ['employer@demo.com', hashedPassword]);
      
      if (employerResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO companies (user_id, name, slug, description, industry, size, country, city, is_active)
          VALUES ($1, 'Demo Company', 'demo-company', 'A demo company for testing', 'Technology', '11-50', 'Kazakhstan', 'Almaty', true)
          ON CONFLICT (slug) DO NOTHING
        `, [employerResult.rows[0].id]);
        console.log('✅ Created employer@demo.com');
      }
    }

    // Test login for each user
    console.log('\n🔐 Testing logins...');
    const testUsers = ['seeker@demo.com', 'employer@demo.com'];
    
    for (const email of testUsers) {
      const result = await pool.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const isValid = await bcrypt.compare('password123', user.password_hash);
        console.log(`${email}: ${isValid ? '✅ Password works' : '❌ Password invalid'}`);
      } else {
        console.log(`${email}: ❌ User not found`);
      }
    }

    console.log('\n✨ Demo accounts ready!');
    console.log('Login credentials:');
    console.log('  Job Seeker: seeker@demo.com / password123');
    console.log('  Employer: employer@demo.com / password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyAndCreateUsers();