// pages/dashboard/saved-jobs.js - Saved/bookmarked jobs page
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import JobCard from '../../components/JobCard'

export default function SavedJobs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role === 'employer') {
      router.push('/dashboard')
    } else if (session) {
      fetchSavedJobs()
    }
  }, [session, status])

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/saved-jobs')
      const data = await res.json()
      setSavedJobs(data.savedJobs || [])
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeSavedJob = async (jobId) => {
    try {
      const res = await fetch(`/api/saved-jobs/${jobId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setSavedJobs(savedJobs.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Error removing saved job:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-600 mt-1">
            Jobs you've bookmarked for later
          </p>
        </div>

        {/* Saved Jobs Grid */}
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard job={job} />
                <button
                  onClick={() => removeSavedJob(job.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition"
                  title="Remove from saved"
                >
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Jobs</h3>
            <p className="text-gray-500 mb-4">
              Start browsing and save jobs you're interested in
            </p>
            <Link href="/jobs">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Browse Jobs
              </button>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        {savedJobs.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-blue-600">{savedJobs.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Ready to Apply</p>
                <p className="text-2xl font-bold text-green-600">
                  {savedJobs.filter(job => !job.has_applied).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {savedJobs.filter(job => {
                    if (!job.deadline) return false
                    const daysUntil = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    return daysUntil <= 7 && daysUntil > 0
                  }).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}