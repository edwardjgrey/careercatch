// pages/api/jobs/[id].js - Single job operations API
import pool from '../../../lib/db'
import MessageButton from '../../components/MessageButton'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Increment view count
      await pool.query(
        'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1',
        [id]
      )

      // Get job details with company info
      const result = await pool.query(
        `SELECT 
          j.*,
          c.name as company_name,
          c.slug as company_slug,
          c.logo_url as company_logo,
          c.industry as company_industry,
          c.size as company_size,
          c.website as company_website
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.id = $1 AND j.is_active = true`,
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      res.status(200).json({ job: result.rows[0] })
    } catch (error) {
      console.error('Error fetching job:', error)
      res.status(500).json({ error: 'Failed to fetch job' })
    }
  } else if (req.method === 'PUT') {
    // Update job (for employers only - TODO: add auth check)
    try {
      const {
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        category,
        job_type,
        experience_level,
        salary_min,
        salary_max,
        salary_currency,
        country,
        city,
        is_remote,
        is_active,
        deadline
      } = req.body

      const result = await pool.query(
        `UPDATE jobs SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          requirements = COALESCE($3, requirements),
          responsibilities = COALESCE($4, responsibilities),
          benefits = COALESCE($5, benefits),
          category = COALESCE($6, category),
          job_type = COALESCE($7, job_type),
          experience_level = COALESCE($8, experience_level),
          salary_min = COALESCE($9, salary_min),
          salary_max = COALESCE($10, salary_max),
          salary_currency = COALESCE($11, salary_currency),
          country = COALESCE($12, country),
          city = COALESCE($13, city),
          is_remote = COALESCE($14, is_remote),
          is_active = COALESCE($15, is_active),
          deadline = COALESCE($16, deadline),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *`,
        [
          title, description, requirements, responsibilities, benefits,
          category, job_type, experience_level, salary_min, salary_max,
          salary_currency, country, city, is_remote, is_active, deadline, id
        ]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      res.status(200).json({ 
        message: 'Job updated successfully',
        job: result.rows[0] 
      })
    } catch (error) {
      console.error('Error updating job:', error)
      res.status(500).json({ error: 'Failed to update job' })
    }
  } else if (req.method === 'DELETE') {
    // Soft delete job (set is_active to false)
    try {
      const result = await pool.query(
        'UPDATE jobs SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      res.status(200).json({ message: 'Job deleted successfully' })
    } catch (error) {
      console.error('Error deleting job:', error)
      res.status(500).json({ error: 'Failed to delete job' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}