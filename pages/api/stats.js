// pages/api/stats.js - Statistics endpoint
import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get counts from database
    const jobsResult = await pool.query('SELECT COUNT(*) FROM jobs WHERE is_active = true')
    const companiesResult = await pool.query('SELECT COUNT(*) FROM companies WHERE is_active = true')
    const usersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'job_seeker'")

    res.status(200).json({
      jobs: parseInt(jobsResult.rows[0].count) || 0,
      companies: parseInt(companiesResult.rows[0].count) || 0,
      users: parseInt(usersResult.rows[0].count) || 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ 
      jobs: 0,
      companies: 0,
      users: 0
    })
  }
}