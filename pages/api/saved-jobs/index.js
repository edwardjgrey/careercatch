// pages/api/saved-jobs/index.js - Saved jobs API
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role === 'employer') {
    return res.status(403).json({ error: 'Employers cannot save jobs' })
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT 
          j.*,
          c.name as company_name,
          c.slug as company_slug,
          c.logo_url as company_logo,
          sj.created_at as saved_at,
          sj.notes as save_notes,
          EXISTS(
            SELECT 1 FROM applications a 
            WHERE a.job_id = j.id AND a.user_id = $1
          ) as has_applied
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE sj.user_id = $1 AND j.is_active = true
        ORDER BY sj.created_at DESC`,
        [session.user.id]
      )

      res.status(200).json({ savedJobs: result.rows })
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      res.status(500).json({ error: 'Failed to fetch saved jobs' })
    }
  } else if (req.method === 'POST') {
    const { jobId, notes } = req.body

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' })
    }

    try {
      // Check if already saved
      const existing = await pool.query(
        'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [session.user.id, jobId]
      )

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Job already saved' })
      }

      // Save the job
      const result = await pool.query(
        'INSERT INTO saved_jobs (user_id, job_id, notes) VALUES ($1, $2, $3) RETURNING *',
        [session.user.id, jobId, notes || null]
      )

      res.status(201).json({ 
        message: 'Job saved successfully',
        savedJob: result.rows[0]
      })
    } catch (error) {
      console.error('Error saving job:', error)
      res.status(500).json({ error: 'Failed to save job' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}