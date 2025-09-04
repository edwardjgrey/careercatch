// pages/api/employer/jobs.js - Get employer's posted jobs
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'employer') {
    return res.status(403).json({ error: 'Only employers can access this endpoint' })
  }

  if (req.method === 'GET') {
    try {
      // Get company ID
      const companyResult = await pool.query(
        'SELECT id FROM companies WHERE user_id = $1',
        [session.user.id]
      )

      if (companyResult.rows.length === 0) {
        return res.status(200).json({ jobs: [] })
      }

      const companyId = companyResult.rows[0].id

      // Get all jobs for this company
      const jobsResult = await pool.query(
        `SELECT 
          j.*,
          c.name as company_name,
          c.slug as company_slug,
          (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.company_id = $1
        ORDER BY j.created_at DESC`,
        [companyId]
      )

      res.status(200).json({ jobs: jobsResult.rows })
    } catch (error) {
      console.error('Error fetching employer jobs:', error)
      res.status(500).json({ error: 'Failed to fetch jobs' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}