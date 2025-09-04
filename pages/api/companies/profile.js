// pages/api/companies/profile.js - Company profile management API for logged-in employer
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'employer') {
    return res.status(403).json({ error: 'Only employers can manage company profiles' })
  }

  if (req.method === 'GET') {
    try {
      // Get company profile for logged in employer
      const result = await pool.query(
        `SELECT * FROM companies WHERE user_id = $1`,
        [session.user.id]
      )

      if (result.rows.length === 0) {
        // Create a new company profile if it doesn't exist
        const createResult = await pool.query(
          `INSERT INTO companies (user_id, name, is_active) 
           VALUES ($1, $2, true) 
           RETURNING *`,
          [session.user.id, session.user.companyName || 'My Company']
        )
        return res.status(200).json({ company: createResult.rows[0] })
      }

      const company = result.rows[0]

      // Parse array fields if they're stored as strings
      const arrayFields = ['benefits', 'tech_stack', 'specialties', 'other_locations']
      arrayFields.forEach(field => {
        if (company[field] && typeof company[field] === 'string') {
          try {
            company[field] = JSON.parse(company[field])
          } catch (e) {
            // If it's not valid JSON, try to split by comma
            company[field] = company[field].split(',').map(item => item.trim())
          }
        }
      })

      res.status(200).json({ company })
    } catch (error) {
      console.error('Error fetching company profile:', error)
      res.status(500).json({ error: 'Failed to fetch company profile' })
    }
  } else if (req.method === 'PUT') {
    const {
      tagline,
      description,
      website,
      email,
      phone,
      country,
      city,
      address,
      other_locations,
      industry,
      size,
      founded_year,
      culture_description,
      benefits,
      mission,
      vision,
      tech_stack,
      specialties,
      logo_url,
      cover_image_url,
      linkedin_url,
      twitter_url,
      facebook_url,
      response_rate
    } = req.body

    try {
      // Convert arrays to JSON strings for PostgreSQL array storage
      const processArray = (field) => {
        if (!field) return null
        if (Array.isArray(field)) {
          return '{' + field.map(item => `"${item}"`).join(',') + '}'
        }
        return field
      }

      const result = await pool.query(
        `UPDATE companies SET
          tagline = $1,
          description = $2,
          website = $3,
          email = $4,
          phone = $5,
          country = $6,
          city = $7,
          address = $8,
          other_locations = $9,
          industry = $10,
          size = $11,
          founded_year = $12,
          culture_description = $13,
          benefits = $14,
          mission = $15,
          vision = $16,
          tech_stack = $17,
          specialties = $18,
          logo_url = $19,
          cover_image_url = $20,
          linkedin_url = $21,
          twitter_url = $22,
          facebook_url = $23,
          response_rate = $24,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $25
        RETURNING *`,
        [
          tagline || null,
          description || null,
          website || null,
          email || null,
          phone || null,
          country || null,
          city || null,
          address || null,
          processArray(other_locations),
          industry || null,
          size || null,
          founded_year ? parseInt(founded_year) : null,
          culture_description || null,
          processArray(benefits),
          mission || null,
          vision || null,
          processArray(tech_stack),
          processArray(specialties),
          logo_url || null,
          cover_image_url || null,
          linkedin_url || null,
          twitter_url || null,
          facebook_url || null,
          response_rate || null,
          session.user.id
        ]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' })
      }

      res.status(200).json({ 
        message: 'Company profile updated successfully',
        company: result.rows[0]
      })
    } catch (error) {
      console.error('Error updating company profile:', error)
      res.status(500).json({ error: 'Failed to update company profile' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}