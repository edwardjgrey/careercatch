// pages/api/dashboard.js - Dashboard data endpoint
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id
  const role = session.user.role

  try {
    let stats = {}
    let recentActivity = []

    if (role === 'employer') {
      // Get employer stats
      const companyResult = await pool.query(
        'SELECT id FROM companies WHERE user_id = $1',
        [userId]
      )
      
      if (companyResult.rows.length > 0) {
        const companyId = companyResult.rows[0].id
        
        // Active jobs count
        const activeJobsResult = await pool.query(
          'SELECT COUNT(*) FROM jobs WHERE company_id = $1 AND is_active = true',
          [companyId]
        )
        stats.activeJobs = parseInt(activeJobsResult.rows[0].count)
        
        // Total applications
        const totalApplicationsResult = await pool.query(
          'SELECT COUNT(*) FROM applications WHERE company_id = $1',
          [companyId]
        )
        stats.totalApplications = parseInt(totalApplicationsResult.rows[0].count)
        
        // Pending review
        const pendingReviewResult = await pool.query(
          "SELECT COUNT(*) FROM applications WHERE company_id = $1 AND status = 'pending'",
          [companyId]
        )
        stats.pendingReview = parseInt(pendingReviewResult.rows[0].count)
        
        // Recent applications
        const recentApplicationsResult = await pool.query(
          `SELECT 
            a.applied_at,
            j.title as job_title,
            u.first_name,
            u.last_name
          FROM applications a
          JOIN jobs j ON a.job_id = j.id
          JOIN users u ON a.user_id = u.id
          WHERE a.company_id = $1
          ORDER BY a.applied_at DESC
          LIMIT 5`,
          [companyId]
        )
        
        recentActivity = recentApplicationsResult.rows.map(app => ({
          type: 'application',
          description: `${app.first_name} ${app.last_name} applied for ${app.job_title}`,
          time: new Date(app.applied_at).toLocaleDateString(),
          link: '/dashboard/applications'
        }))
      }
    } else {
      // Get job seeker stats
      const applicationsResult = await pool.query(
        'SELECT COUNT(*) FROM applications WHERE user_id = $1',
        [userId]
      )
      stats.applications = parseInt(applicationsResult.rows[0].count)
      
      const savedJobsResult = await pool.query(
        'SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1',
        [userId]
      )
      stats.savedJobs = parseInt(savedJobsResult.rows[0].count)
      
      // Profile views (placeholder - would need view tracking)
      stats.profileViews = 0
      
      // Recent applications
      const recentApplicationsResult = await pool.query(
        `SELECT 
          a.applied_at,
          a.status,
          j.title as job_title,
          j.id as job_id,
          c.name as company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.applied_at DESC
        LIMIT 5`,
        [userId]
      )
      
      recentActivity = recentApplicationsResult.rows.map(app => ({
        type: 'application',
        description: `Applied for ${app.job_title} at ${app.company_name}`,
        time: new Date(app.applied_at).toLocaleDateString(),
        link: `/jobs/${app.job_id}`
      }))
    }

    res.status(200).json({ stats, recentActivity })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}