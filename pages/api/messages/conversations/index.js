// pages/api/messages/conversations.js - Get user conversations
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
      const result = await pool.query(
        `SELECT 
          c.id,
          c.updated_at as last_message_at,
          CASE 
            WHEN c.user1_id = $1 THEN c.user2_id
            ELSE c.user1_id
          END as other_user_id,
          CASE 
            WHEN c.user1_id = $1 THEN u2.first_name || ' ' || u2.last_name
            ELSE u1.first_name || ' ' || u1.last_name
          END as other_user_name,
          m.content as last_message,
          (
            SELECT COUNT(*) FROM messages 
            WHERE conversation_id = c.id 
            AND sender_id != $1 
            AND is_read = false
          ) as unread_count
        FROM conversations c
        LEFT JOIN users u1 ON c.user1_id = u1.id
        LEFT JOIN users u2 ON c.user2_id = u2.id
        LEFT JOIN LATERAL (
          SELECT content FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) m ON true
        WHERE c.user1_id = $1 OR c.user2_id = $1
        ORDER BY c.updated_at DESC`,
        [session.user.id]
      )

      res.status(200).json({ conversations: result.rows })
    } catch (error) {
      console.error('Error fetching conversations:', error)
      res.status(500).json({ error: 'Failed to fetch conversations' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// pages/api/messages/send.js - Send a message
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { conversationId, recipientId, content } = req.body

    if (!content || (!conversationId && !recipientId)) {
      return res.status(400).json({ error: 'Invalid request data' })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      let convId = conversationId

      // Create conversation if it doesn't exist
      if (!convId && recipientId) {
        const existingConv = await client.query(
          `SELECT id FROM conversations 
          WHERE (user1_id = $1 AND user2_id = $2) 
          OR (user1_id = $2 AND user2_id = $1)`,
          [session.user.id, recipientId]
        )

        if (existingConv.rows.length > 0) {
          convId = existingConv.rows[0].id
        } else {
          const newConv = await client.query(
            `INSERT INTO conversations (user1_id, user2_id) 
            VALUES ($1, $2) RETURNING id`,
            [session.user.id, recipientId]
          )
          convId = newConv.rows[0].id
        }
      }

      // Insert message
      const messageResult = await client.query(
        `INSERT INTO messages (conversation_id, sender_id, content) 
        VALUES ($1, $2, $3) 
        RETURNING *`,
        [convId, session.user.id, content]
      )

      // Update conversation last activity
      await client.query(
        `UPDATE conversations 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1`,
        [convId]
      )

      await client.query('COMMIT')

      res.status(200).json({ 
        message: messageResult.rows[0],
        conversationId: convId
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error sending message:', error)
      res.status(500).json({ error: 'Failed to send message' })
    } finally {
      client.release()
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// pages/api/analytics/index.js - Analytics data endpoint
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { range = '30days' } = req.query
  const isEmployer = session.user.role === 'employer'

  // Calculate date range
  const daysMap = {
    '7days': 7,
    '30days': 30,
    '90days': 90,
    '365days': 365
  }
  const days = daysMap[range] || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    let analyticsData = {}

    if (isEmployer) {
      // Get company ID
      const companyResult = await pool.query(
        'SELECT id FROM companies WHERE user_id = $1',
        [session.user.id]
      )
      
      if (companyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' })
      }
      
      const companyId = companyResult.rows[0].id

      // Total views
      const viewsResult = await pool.query(
        `SELECT SUM(views_count) as total, 
        COUNT(*) as job_count
        FROM jobs 
        WHERE company_id = $1 AND created_at >= $2`,
        [companyId, startDate]
      )
      analyticsData.totalViews = parseInt(viewsResult.rows[0].total) || 0

      // Total applications
      const appsResult = await pool.query(
        `SELECT COUNT(*) as total 
        FROM applications 
        WHERE company_id = $1 AND applied_at >= $2`,
        [companyId, startDate]
      )
      analyticsData.totalApplications = parseInt(appsResult.rows[0].total) || 0

      // Conversion rate (views to applications)
      analyticsData.conversionRate = analyticsData.totalViews > 0 
        ? Math.round((analyticsData.totalApplications / analyticsData.totalViews) * 100)
        : 0

      // Trend data
      const trendResult = await pool.query(
        `SELECT 
          DATE(applied_at) as date,
          COUNT(*) as value
        FROM applications
        WHERE company_id = $1 AND applied_at >= $2
        GROUP BY DATE(applied_at)
        ORDER BY date`,
        [companyId, startDate]
      )
      analyticsData.trendData = trendResult.rows

      // Category performance
      const categoryResult = await pool.query(
        `SELECT 
          j.category,
          COUNT(a.id) as count
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.company_id = $1 AND j.created_at >= $2
        GROUP BY j.category
        ORDER BY count DESC`,
        [companyId, startDate]
      )
      analyticsData.categoryPerformance = categoryResult.rows

      // Status distribution
      const statusResult = await pool.query(
        `SELECT 
          status,
          COUNT(*) as value
        FROM applications
        WHERE company_id = $1 AND applied_at >= $2
        GROUP BY status`,
        [companyId, startDate]
      )
      analyticsData.statusDistribution = statusResult.rows.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        value: parseInt(row.value)
      }))

      // Top performing jobs
      const topJobsResult = await pool.query(
        `SELECT 
          j.title,
          j.views_count,
          COUNT(a.id) as applications
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.company_id = $1 AND j.created_at >= $2
        GROUP BY j.id, j.title, j.views_count
        ORDER BY j.views_count DESC
        LIMIT 5`,
        [companyId, startDate]
      )
      analyticsData.topPerformers = topJobsResult.rows.map(job => ({
        title: job.title,
        subtitle: `${job.applications} applications`,
        value: job.views_count,
        metric: 'views'
      }))

    } else {
      // Job seeker analytics
      
      // Applications sent
      const appsResult = await pool.query(
        `SELECT COUNT(*) as total 
        FROM applications 
        WHERE user_id = $1 AND applied_at >= $2`,
        [session.user.id, startDate]
      )
      analyticsData.applicationsSent = parseInt(appsResult.rows[0].total) || 0

      // Response rate
      const responseResult = await pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status != 'pending') as responded
        FROM applications
        WHERE user_id = $1 AND applied_at >= $2`,
        [session.user.id, startDate]
      )
      const responseData = responseResult.rows[0]
      analyticsData.responseRate = responseData.total > 0
        ? Math.round((responseData.responded / responseData.total) * 100)
        : 0

      // Saved jobs
      const savedResult = await pool.query(
        `SELECT COUNT(*) as total 
        FROM saved_jobs 
        WHERE user_id = $1`,
        [session.user.id]
      )
      analyticsData.savedJobs = parseInt(savedResult.rows[0].total) || 0

      // Activity trend
      const trendResult = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as value
        FROM (
          SELECT applied_at as created_at FROM applications WHERE user_id = $1 AND applied_at >= $2
          UNION ALL
          SELECT created_at FROM saved_jobs WHERE user_id = $1 AND created_at >= $2
        ) activities
        GROUP BY DATE(created_at)
        ORDER BY date`,
        [session.user.id, startDate]
      )
      analyticsData.trendData = trendResult.rows

      // Applications by category
      const categoryResult = await pool.query(
        `SELECT 
          j.category,
          COUNT(*) as count
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.user_id = $1 AND a.applied_at >= $2
        GROUP BY j.category
        ORDER BY count DESC`,
        [session.user.id, startDate]
      )
      analyticsData.categoryPerformance = categoryResult.rows

      // Application status distribution
      const statusResult = await pool.query(
        `SELECT 
          status,
          COUNT(*) as value
        FROM applications
        WHERE user_id = $1 AND applied_at >= $2
        GROUP BY status`,
        [session.user.id, startDate]
      )
      analyticsData.statusDistribution = statusResult.rows.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        value: parseInt(row.value)
      }))
    }

    // Generate heatmap data (example)
    analyticsData.heatmapData = Array.from({ length: 28 }, () => 
      Math.floor(Math.random() * 100)
    )

    // Peak times
    analyticsData.peakTimes = [
      { period: 'Morning (6-12)', percentage: 35 },
      { period: 'Afternoon (12-18)', percentage: 45 },
      { period: 'Evening (18-24)', percentage: 20 }
    ]

    // Engagement score
    analyticsData.engagementScore = Math.floor(Math.random() * 30) + 70

    // Activity breakdown
    analyticsData.activityBreakdown = isEmployer ? [
      { icon: '👁️', type: 'Job Views', count: analyticsData.totalViews },
      { icon: '📋', type: 'Applications', count: analyticsData.totalApplications },
      { icon: '💬', type: 'Messages', count: Math.floor(Math.random() * 50) },
      { icon: '⭐', type: 'Shortlisted', count: Math.floor(Math.random() * 20) }
    ] : [
      { icon: '📤', type: 'Applications', count: analyticsData.applicationsSent },
      { icon: '⭐', type: 'Saved Jobs', count: analyticsData.savedJobs },
      { icon: '👁️', type: 'Profile Views', count: Math.floor(Math.random() * 100) },
      { icon: '💬', type: 'Messages', count: Math.floor(Math.random() * 30) }
    ]

    // AI Insights
    analyticsData.aiInsights = isEmployer ? [
      {
        icon: '🎯',
        title: 'Optimize Job Titles',
        description: 'Jobs with specific titles get 40% more applications',
        action: 'View Tips'
      },
      {
        icon: '📈',
        title: 'Best Posting Time',
        description: 'Tuesday mornings see 25% higher engagement',
        action: 'Schedule Post'
      },
      {
        icon: '💰',
        title: 'Salary Transparency',
        description: 'Jobs with salary ranges get 3x more views',
        action: 'Update Jobs'
      },
      {
        icon: '🚀',
        title: 'Boost Performance',
        description: 'Featured jobs receive 5x more applications',
        action: 'Go Premium'
      }
    ] : [
      {
        icon: '✨',
        title: 'Profile Strength',
        description: 'Complete profiles get 2x more views',
        action: 'Update Profile'
      },
      {
        icon: '🎯',
        title: 'Application Quality',
        description: 'Personalized cover letters have 60% higher success rate',
        action: 'View Tips'
      },
      {
        icon: '📚',
        title: 'Skills Gap',
        description: 'Add JavaScript to match 15 more jobs',
        action: 'Add Skills'
      },
      {
        icon: '🔔',
        title: 'Job Alerts',
        description: 'Set up alerts to never miss opportunities',
        action: 'Create Alert'
      }
    ]

    // Recommendations
    analyticsData.recommendations = [
      {
        icon: '⚡',
        title: isEmployer ? 'Improve Job Descriptions' : 'Update Your Resume',
        description: isEmployer 
          ? 'Clear, detailed job descriptions get 50% more qualified applicants'
          : 'Resumes updated monthly get 3x more views',
        priority: 'high',
        impact: 'High impact'
      },
      {
        icon: '🎓',
        title: isEmployer ? 'Expand Talent Pool' : 'Expand Your Skills',
        description: isEmployer
          ? 'Consider remote candidates to access 10x more talent'
          : 'Learning in-demand skills increases opportunities by 40%',
        priority: 'medium',
        impact: 'Medium impact'
      }
    ]

    res.status(200).json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}