// pages/api/jobs/index.js - Enhanced jobs API
import pool from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        q = '', 
        location = '',
        category = '',
        type = '',
        sort = 'newest'
      } = req.query

      let query = `
        SELECT 
          j.*,
          c.name as company_name,
          c.logo_url as company_logo,
          c.slug as company_slug
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = true
      `
      const params = []
      let paramCount = 0

      // Add search filter
      if (q) {
        paramCount++
        query += ` AND (j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`
        params.push(`%${q}%`)
      }

      // Add location filter
      if (location) {
        paramCount++
        query += ` AND (j.city = $${paramCount} OR j.country = $${paramCount})`
        params.push(location)
      }

      // Add category filter
      if (category) {
        paramCount++
        query += ` AND j.category = $${paramCount}`
        params.push(category)
      }

      // Add job type filter
      if (type) {
        paramCount++
        query += ` AND j.job_type = $${paramCount}`
        params.push(type)
      }

      // Add sorting
      switch (sort) {
        case 'salary':
          query += ' ORDER BY j.salary_max DESC NULLS LAST'
          break
        case 'oldest':
          query += ' ORDER BY j.created_at ASC'
          break
        default: // newest
          query += ' ORDER BY j.created_at DESC'
      }

      // Add pagination
      paramCount++
      query += ` LIMIT $${paramCount}`
      params.push(parseInt(limit))
      
      paramCount++
      query += ` OFFSET $${paramCount}`
      params.push(parseInt(offset))

      const result = await pool.query(query, params)
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) 
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = true
      `
      const countParams = []
      let countParamCount = 0

      if (q) {
        countParamCount++
        countQuery += ` AND (j.title ILIKE $${countParamCount} OR j.description ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount})`
        countParams.push(`%${q}%`)
      }

      if (location) {
        countParamCount++
        countQuery += ` AND (j.city = $${countParamCount} OR j.country = $${countParamCount})`
        countParams.push(location)
      }

      if (category) {
        countParamCount++
        countQuery += ` AND j.category = $${countParamCount}`
        countParams.push(category)
      }

      if (type) {
        countParamCount++
        countQuery += ` AND j.job_type = $${countParamCount}`
        countParams.push(type)
      }

      const countResult = await pool.query(countQuery, countParams)
      const total = parseInt(countResult.rows[0].count)

      res.status(200).json({
        jobs: result.rows,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      res.status(500).json({ 
        error: 'Failed to fetch jobs',
        jobs: [],
        total: 0 
      })
    }
  } else if (req.method === 'POST') {
    // TODO: Add authentication check here
    try {
      const {
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        category,
        job_type = 'full_time',
        experience_level = 'mid',
        salary_min,
        salary_max,
        salary_currency = 'USD',
        country,
        city,
        is_remote = false,
        company_id,
        posted_by
      } = req.body

      // Generate slug from title
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

      const result = await pool.query(
        `INSERT INTO jobs (
          company_id, posted_by, title, slug, description, requirements, 
          responsibilities, benefits, category, job_type, experience_level,
          salary_min, salary_max, salary_currency, country, city, is_remote
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          company_id, posted_by, title, slug, description, requirements,
          responsibilities, benefits, category, job_type, experience_level,
          salary_min, salary_max, salary_currency, country, city, is_remote
        ]
      )

      res.status(201).json({
        message: 'Job created successfully',
        job: result.rows[0]
      })
    } catch (error) {
      console.error('Error creating job:', error)
      res.status(500).json({ error: 'Failed to create job' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}