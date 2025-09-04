// pages/api/auth/register.js - User registration endpoint
import bcrypt from 'bcryptjs'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    country,
    city,
    role,
    companyName,
    companyWebsite,
    companySize,
    industry
  } = req.body

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  // Validate role
  if (!['job_seeker', 'employer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (
        email, password_hash, role, first_name, last_name, 
        phone, country, city, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false) 
      RETURNING id, email, role, first_name, last_name`,
      [email, hashedPassword, role, firstName, lastName, phone, country, city]
    )

    const user = userResult.rows[0]

    // If employer, create company
    if (role === 'employer' && companyName) {
      const companySlug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()

      await client.query(
        `INSERT INTO companies (
          user_id, name, slug, website, industry, size, 
          country, city, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
        [
          user.id, 
          companyName, 
          companySlug, 
          companyWebsite || null,
          industry || null,
          companySize || null,
          country,
          city
        ]
      )
    }

    // If job seeker, create profile
    if (role === 'job_seeker') {
      await client.query(
        `INSERT INTO job_seeker_profiles (user_id, is_open_to_work) 
         VALUES ($1, true)`,
        [user.id]
      )
    }

    await client.query('COMMIT')

    // Send success response
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      }
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create account. Please try again.' })
  } finally {
    client.release()
  }
}