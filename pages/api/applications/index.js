// pages/api/applications/index.js - Job applications API
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
      let query, params

      if (session.user.role === 'employer') {
        // Get applications for employer's jobs
        const companyResult = await pool.query(
          'SELECT id FROM companies WHERE user_id = $1',
          [session.user.id]
        )
        
        if (companyResult.rows.length === 0) {
          return res.status(200).json({ applications: [] })
        }

        query = `
          SELECT 
            a.*,
            j.title as job_title,
            j.slug as job_slug,
            u.first_name,
            u.last_name,
            u.email as applicant_email,
            u.phone as applicant_phone
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
          JOIN users u ON a.user_id = u.id
          WHERE a.company_id = $1
          ORDER BY a.applied_at DESC
        `
        params = [companyResult.rows[0].id]
      } else {
        // Get applications for job seeker
        query = `
          SELECT 
            a.*,
            j.title as job_title,
            j.slug as job_slug,
            c.name as company_name,
            c.slug as company_slug
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
          JOIN companies c ON j.company_id = c.id
          WHERE a.user_id = $1
          ORDER BY a.applied_at DESC
        `
        params = [session.user.id]
      }

      const result = await pool.query(query, params)
      res.status(200).json({ applications: result.rows })
    } catch (error) {
      console.error('Error fetching applications:', error)
      res.status(500).json({ error: 'Failed to fetch applications' })
    }
  } else if (req.method === 'POST') {
    if (session.user.role === 'employer') {
      return res.status(403).json({ error: 'Employers cannot apply for jobs' })
    }

    const {
      jobId,
      companyId,
      coverLetter,
      expectedSalary,
      salaryCurrency,
      availableFrom,
      resumeUrl
    } = req.body

    if (!jobId || !coverLetter) {
      return res.status(400).json({ error: 'Job ID and cover letter are required' })
    }

    try {
      // Check if already applied
      const existingApp = await pool.query(
        'SELECT id FROM applications WHERE job_id = $1 AND user_id = $2',
        [jobId, session.user.id]
      )

      if (existingApp.rows.length > 0) {
        return res.status(400).json({ error: 'You have already applied for this job' })
      }

      // Create application
      const result = await pool.query(
        `INSERT INTO applications (
          job_id, user_id, company_id, cover_letter, resume_url,
          expected_salary, salary_currency, available_from, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING *`,
        [
          jobId,
          session.user.id,
          companyId,
          coverLetter,
          resumeUrl || null,
          expectedSalary || null,
          salaryCurrency || 'USD',
          availableFrom || null
        ]
      )

      // Update job application count
      await pool.query(
        'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
        [jobId]
      )

      res.status(201).json({
        message: 'Application submitted successfully',
        application: result.rows[0]
      })
    } catch (error) {
      console.error('Error submitting application:', error)
      res.status(500).json({ error: 'Failed to submit application' })
    }
  } else if (req.method === 'PUT') {
    // Update application status (for employers)
    if (session.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can update application status' })
    }

    const { applicationId, status, notes, rejectionReason } = req.body

    try {
      const result = await pool.query(
        `UPDATE applications 
        SET status = $1, employer_notes = $2, rejection_reason = $3, 
            reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *`,
        [status, notes || null, rejectionReason || null, applicationId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' })
      }

      res.status(200).json({
        message: 'Application updated',
        application: result.rows[0]
      })
    } catch (error) {
      console.error('Error updating application:', error)
      res.status(500).json({ error: 'Failed to update application' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}