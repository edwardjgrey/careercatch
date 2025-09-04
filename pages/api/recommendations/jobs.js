// pages/api/recommendations/jobs.js - AI-powered job recommendations
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

// Calculate similarity score between user profile and job
function calculateMatchScore(userProfile, job) {
  let score = 0
  let factors = []

  // Skill matching (40% weight)
  if (userProfile.skills && job.skills_required) {
    const userSkills = userProfile.skills.map(s => s.toLowerCase())
    const jobSkills = job.skills_required.map(s => s.toLowerCase())
    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    )
    const skillScore = (matchedSkills.length / jobSkills.length) * 40
    score += skillScore
    factors.push({
      factor: 'skills',
      matched: matchedSkills,
      score: skillScore
    })
  }

  // Experience level matching (20% weight)
  if (userProfile.experience_years && job.experience_years_min) {
    const expDiff = userProfile.experience_years - job.experience_years_min
    let expScore = 0
    if (expDiff >= 0 && expDiff <= 2) {
      expScore = 20 // Perfect match
    } else if (expDiff > 2 && expDiff <= 5) {
      expScore = 15 // Overqualified but acceptable
    } else if (expDiff < 0 && expDiff >= -1) {
      expScore = 10 // Slightly underqualified
    }
    score += expScore
    factors.push({
      factor: 'experience',
      userYears: userProfile.experience_years,
      requiredYears: job.experience_years_min,
      score: expScore
    })
  }

  // Location matching (15% weight)
  if (userProfile.city === job.city) {
    score += 15
    factors.push({ factor: 'location', type: 'exact_city', score: 15 })
  } else if (userProfile.country === job.country) {
    score += 10
    factors.push({ factor: 'location', type: 'same_country', score: 10 })
  } else if (job.is_remote) {
    score += 15
    factors.push({ factor: 'location', type: 'remote', score: 15 })
  }

  // Salary expectation matching (15% weight)
  if (userProfile.desired_salary_min && job.salary_max) {
    const salaryRatio = job.salary_max / userProfile.desired_salary_min
    let salaryScore = 0
    if (salaryRatio >= 1 && salaryRatio <= 1.3) {
      salaryScore = 15 // Good match
    } else if (salaryRatio > 1.3) {
      salaryScore = 12 // Better than expected
    } else if (salaryRatio >= 0.8) {
      salaryScore = 8 // Slightly below expectation
    }
    score += salaryScore
    factors.push({
      factor: 'salary',
      ratio: salaryRatio,
      score: salaryScore
    })
  }

  // Category/Industry matching (10% weight)
  if (userProfile.preferred_categories?.includes(job.category)) {
    score += 10
    factors.push({ factor: 'category', matched: job.category, score: 10 })
  }

  return {
    totalScore: Math.round(score),
    factors,
    matchPercentage: Math.round(score)
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'job_seeker') {
    return res.status(403).json({ error: 'Only job seekers can get recommendations' })
  }

  if (req.method === 'GET') {
    try {
      const { limit = 10, excludeApplied = true } = req.query

      // Get user profile with skills and preferences
      const profileResult = await pool.query(
        `SELECT 
          u.city, u.country,
          jsp.skills, jsp.experience_years, 
          jsp.desired_salary_min, jsp.desired_salary_max,
          jsp.salary_currency, jsp.preferred_job_types,
          jsp.preferred_categories, jsp.languages
        FROM users u
        LEFT JOIN job_seeker_profiles jsp ON u.id = jsp.user_id
        WHERE u.id = $1`,
        [session.user.id]
      )

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      const userProfile = profileResult.rows[0]

      // Get active jobs with company info
      let jobsQuery = `
        SELECT 
          j.*,
          c.name as company_name,
          c.slug as company_slug,
          c.logo_url as company_logo,
          c.industry as company_industry,
          EXISTS(
            SELECT 1 FROM saved_jobs sj 
            WHERE sj.job_id = j.id AND sj.user_id = $1
          ) as is_saved
      `

      if (excludeApplied === 'true') {
        jobsQuery += `,
          NOT EXISTS(
            SELECT 1 FROM applications a 
            WHERE a.job_id = j.id AND a.user_id = $1
          ) as not_applied
        `
      }

      jobsQuery += `
        FROM jobs j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = true
      `

      if (excludeApplied === 'true') {
        jobsQuery += `
          AND NOT EXISTS(
            SELECT 1 FROM applications a 
            WHERE a.job_id = j.id AND a.user_id = $1
          )
        `
      }

      jobsQuery += ` ORDER BY j.created_at DESC LIMIT 100`

      const jobsResult = await pool.query(jobsQuery, [session.user.id])

      // Calculate match scores for each job
      const recommendedJobs = jobsResult.rows.map(job => {
        const matchData = calculateMatchScore(userProfile, job)
        return {
          ...job,
          matchScore: matchData.totalScore,
          matchPercentage: matchData.matchPercentage,
          matchFactors: matchData.factors
        }
      })

      // Sort by match score and limit results
      const topRecommendations = recommendedJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, parseInt(limit))

      // Track recommendations for analytics
      if (topRecommendations.length > 0) {
        const recommendationData = topRecommendations.map(job => 
          `(${session.user.id}, ${job.id}, ${job.matchScore})`
        ).join(',')

        await pool.query(
          `INSERT INTO recommendation_logs (user_id, job_id, match_score)
          VALUES ${recommendationData}
          ON CONFLICT DO NOTHING`
        )
      }

      res.status(200).json({
        recommendations: topRecommendations,
        userProfile: {
          hasCompleteProfile: !!(userProfile.skills?.length && userProfile.experience_years),
          missingFields: []
        }
      })

    } catch (error) {
      console.error('Error getting recommendations:', error)
      res.status(500).json({ error: 'Failed to get recommendations' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// pages/api/recommendations/candidates.js - Candidate recommendations for employers
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import pool from '../../../lib/db'

function calculateCandidateScore(candidate, job) {
  let score = 0
  let factors = []

  // Skills matching
  if (candidate.skills && job.skills_required) {
    const candidateSkills = candidate.skills.map(s => s.toLowerCase())
    const requiredSkills = job.skills_required.map(s => s.toLowerCase())
    const matchedSkills = requiredSkills.filter(skill => 
      candidateSkills.some(candSkill => 
        candSkill.includes(skill) || skill.includes(candSkill)
      )
    )
    const skillScore = (matchedSkills.length / requiredSkills.length) * 50
    score += skillScore
    factors.push({
      factor: 'skills',
      matched: matchedSkills.length,
      required: requiredSkills.length,
      score: skillScore
    })
  }

  // Experience matching
  if (candidate.experience_years !== null && job.experience_years_min !== null) {
    const expDiff = candidate.experience_years - job.experience_years_min
    let expScore = 0
    if (expDiff >= 0 && expDiff <= 3) {
      expScore = 25
    } else if (expDiff > 3) {
      expScore = 20
    } else if (expDiff >= -1) {
      expScore = 15
    }
    score += expScore
    factors.push({
      factor: 'experience',
      candidateYears: candidate.experience_years,
      requiredYears: job.experience_years_min,
      score: expScore
    })
  }

  // Location matching
  if (candidate.city === job.city) {
    score += 15
    factors.push({ factor: 'location', type: 'same_city', score: 15 })
  } else if (candidate.country === job.country) {
    score += 10
    factors.push({ factor: 'location', type: 'same_country', score: 10 })
  } else if (candidate.open_to_remote && job.is_remote) {
    score += 15
    factors.push({ factor: 'location', type: 'remote_match', score: 15 })
  }

  // Language matching
  if (candidate.languages && job.languages_required) {
    const matchedLangs = job.languages_required.filter(lang =>
      candidate.languages.some(cl => cl.toLowerCase() === lang.toLowerCase())
    )
    if (matchedLangs.length === job.languages_required.length) {
      score += 10
      factors.push({ factor: 'languages', matched: matchedLangs, score: 10 })
    }
  }

  return {
    totalScore: Math.round(score),
    factors,
    matchPercentage: Math.round(score)
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'employer') {
    return res.status(403).json({ error: 'Only employers can get candidate recommendations' })
  }

  if (req.method === 'GET') {
    try {
      const { jobId, limit = 20 } = req.query

      if (!jobId) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      // Get job details
      const jobResult = await pool.query(
        `SELECT * FROM jobs WHERE id = $1 AND company_id = (
          SELECT id FROM companies WHERE user_id = $2
        )`,
        [jobId, session.user.id]
      )

      if (jobResult.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' })
      }

      const job = jobResult.rows[0]

      // Get potential candidates (job seekers who are open to work)
      const candidatesResult = await pool.query(
        `SELECT 
          u.id, u.first_name, u.last_name, u.email,
          u.city, u.country, u.phone,
          jsp.headline, jsp.skills, jsp.experience_years,
          jsp.languages, jsp.desired_salary_min, jsp.desired_salary_max,
          jsp.is_open_to_work, jsp.current_position,
          EXISTS(
            SELECT 1 FROM applications a 
            WHERE a.job_id = $1 AND a.user_id = u.id
          ) as has_applied
        FROM users u
        JOIN job_seeker_profiles jsp ON u.id = jsp.user_id
        WHERE u.role = 'job_seeker' 
          AND jsp.is_open_to_work = true
          AND u.is_active = true
        ORDER BY jsp.updated_at DESC
        LIMIT 200`,
        [jobId]
      )

      // Calculate match scores
      const recommendations = candidatesResult.rows.map(candidate => {
        const matchData = calculateCandidateScore(candidate, job)
        return {
          ...candidate,
          matchScore: matchData.totalScore,
          matchPercentage: matchData.matchPercentage,
          matchFactors: matchData.factors
        }
      })

      // Sort by match score and limit
      const topCandidates = recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, parseInt(limit))

      res.status(200).json({
        jobTitle: job.title,
        candidates: topCandidates,
        totalCandidates: candidatesResult.rows.length
      })

    } catch (error) {
      console.error('Error getting candidate recommendations:', error)
      res.status(500).json({ error: 'Failed to get recommendations' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}