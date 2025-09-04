// pages/api/companies/index.js - Companies listing API (already exists, updating)
import pool from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT 
          c.*,
          COUNT(DISTINCT j.id) FILTER (WHERE j.is_active = true) as active_jobs_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.name ASC`
      )

      res.status(200).json({ companies: result.rows })
    } catch (error) {
      console.error('Error fetching companies:', error)
      res.status(500).json({ error: 'Failed to fetch companies' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}