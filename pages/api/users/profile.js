// pages/api/users/profile.js - User profile API with GET and PUT
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      // Get user basic info
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [session.user.id]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      const user = userResult.rows[0]
      let profile = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city
      }

      // Get additional profile data based on role
      if (session.user.role === 'job_seeker') {
        const profileResult = await pool.query(
          'SELECT * FROM job_seeker_profiles WHERE user_id = $1',
          [session.user.id]
        )

        if (profileResult.rows.length > 0) {
          const seekerProfile = profileResult.rows[0]
          profile = {
            ...profile,
            headline: seekerProfile.headline,
            summary: seekerProfile.summary,
            skills: seekerProfile.skills?.join(', ') || '',
            languages: seekerProfile.languages?.join(', ') || '',
            experienceYears: seekerProfile.experience_years,
            currentPosition: seekerProfile.current_position,
            desiredSalaryMin: seekerProfile.desired_salary_min,
            desiredSalaryMax: seekerProfile.desired_salary_max,
            salaryCurrency: seekerProfile.salary_currency,
            isOpenToWork: seekerProfile.is_open_to_work
          }
        }
      } else if (session.user.role === 'employer') {
        const companyResult = await pool.query(
          'SELECT * FROM companies WHERE user_id = $1',
          [session.user.id]
        )

        if (companyResult.rows.length > 0) {
          const company = companyResult.rows[0]
          profile = {
            ...profile,
            companyName: company.name,
            companyDescription: company.description,
            companyWebsite: company.website,
            companySize: company.size,
            industry: company.industry
          }
        }
      }

      res.status(200).json({ profile })
    } catch (error) {
      console.error('Error fetching profile:', error)
      res.status(500).json({ error: 'Failed to fetch profile' })
    }
  } else if (req.method === 'PUT') {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Update user basic info
      await client.query(
        `UPDATE users SET 
          first_name = $1, 
          last_name = $2, 
          phone = $3, 
          country = $4, 
          city = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6`,
        [
          req.body.firstName,
          req.body.lastName,
          req.body.phone,
          req.body.country,
          req.body.city,
          session.user.id
        ]
      )

      // Update role-specific data
      if (session.user.role === 'job_seeker') {
        // Parse skills and languages
        const skills = req.body.skills 
          ? req.body.skills.split(',').map(s => s.trim()).filter(s => s)
          : []
        const languages = req.body.languages
          ? req.body.languages.split(',').map(l => l.trim()).filter(l => l)
          : []

        // Check if profile exists
        const profileExists = await client.query(
          'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
          [session.user.id]
        )

        if (profileExists.rows.length > 0) {
          // Update existing profile
          await client.query(
            `UPDATE job_seeker_profiles SET
              headline = $1,
              summary = $2,
              skills = $3,
              languages = $4,
              experience_years = $5,
              current_position = $6,
              desired_salary_min = $7,
              desired_salary_max = $8,
              salary_currency = $9,
              is_open_to_work = $10,
              updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $11`,
            [
              req.body.headline || null,
              req.body.summary || null,
              skills,
              languages,
              req.body.experienceYears ? parseInt(req.body.experienceYears) : null,
              req.body.currentPosition || null,
              req.body.desiredSalaryMin ? parseInt(req.body.desiredSalaryMin) : null,
              req.body.desiredSalaryMax ? parseInt(req.body.desiredSalaryMax) : null,
              req.body.salaryCurrency || 'USD',
              req.body.isOpenToWork || false,
              session.user.id
            ]
          )
        } else {
          // Create new profile
          await client.query(
            `INSERT INTO job_seeker_profiles (
              user_id, headline, summary, skills, languages,
              experience_years, current_position, desired_salary_min,
              desired_salary_max, salary_currency, is_open_to_work
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              session.user.id,
              req.body.headline || null,
              req.body.summary || null,
              skills,
              languages,
              req.body.experienceYears ? parseInt(req.body.experienceYears) : null,
              req.body.currentPosition || null,
              req.body.desiredSalaryMin ? parseInt(req.body.desiredSalaryMin) : null,
              req.body.desiredSalaryMax ? parseInt(req.body.desiredSalaryMax) : null,
              req.body.salaryCurrency || 'USD',
              req.body.isOpenToWork || false
            ]
          )
        }
      } else if (session.user.role === 'employer') {
        // Update company info
        await client.query(
          `UPDATE companies SET
            description = $1,
            website = $2,
            size = $3,
            industry = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $5`,
          [
            req.body.companyDescription || null,
            req.body.companyWebsite || null,
            req.body.companySize || null,
            req.body.industry || null,
            session.user.id
          ]
        )
      }

      await client.query('COMMIT')

      res.status(200).json({ message: 'Profile updated successfully' })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error updating profile:', error)
      res.status(500).json({ error: 'Failed to update profile' })
    } finally {
      client.release()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}