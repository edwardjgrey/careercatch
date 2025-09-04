// pages/api/companies/[id]/index.js - Individual company API
import pool from '../../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Try to find by slug first, then by ID
      let query = `
        SELECT * FROM companies 
        WHERE (slug = $1 OR id::text = $1) AND is_active = true
        LIMIT 1
      `
      
      const result = await pool.query(query, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' })
      }

      res.status(200).json({ company: result.rows[0] })
    } catch (error) {
      console.error('Error fetching company:', error)
      res.status(500).json({ error: 'Failed to fetch company' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}