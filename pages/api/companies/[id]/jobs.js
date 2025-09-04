// pages/api/companies/[id]/jobs.js - Get jobs for a specific company
import pool from '../../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // First get the company to ensure it exists
      const companyResult = await pool.query(
        'SELECT id FROM companies WHERE (slug = $1 OR id::text = $1) AND is_active = true',
        [id]
      )

      if (companyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' })
      }

      const companyId = companyResult.rows[0].id

      // Get all jobs for this company
      const jobsResult = await pool.query(
        `SELECT 
          j.*,
          (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        WHERE j.company_id = $1
        ORDER BY j.is_active DESC, j.created_at DESC`,
        [companyId]
      )

      res.status(200).json({ jobs: jobsResult.rows })
    } catch (error) {
      console.error('Error fetching company jobs:', error)
      res.status(500).json({ error: 'Failed to fetch company jobs' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}