// pages/api/saved-jobs/[id].js - Delete saved job
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING *',
        [session.user.id, id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Saved job not found' })
      }

      res.status(200).json({ message: 'Job removed from saved' })
    } catch (error) {
      console.error('Error removing saved job:', error)
      res.status(500).json({ error: 'Failed to remove saved job' })
    }
  } else if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [session.user.id, id]
      )

      res.status(200).json({ 
        isSaved: result.rows.length > 0,
        savedJob: result.rows[0] || null
      })
    } catch (error) {
      console.error('Error checking saved status:', error)
      res.status(500).json({ error: 'Failed to check saved status' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}