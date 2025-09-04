// pages/dashboard/posted-jobs.js - Employer's posted jobs management
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { formatDistanceToNow } from 'date-fns'

export default function PostedJobs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'employer') {
      router.push('/dashboard')
    } else if (session) {
      fetchPostedJobs()
    }
  }, [session, status])

  const fetchPostedJobs = async () => {
    try {
      const res = await fetch('/api/employer/jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching posted jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      })

      if (res.ok) {
        fetchPostedJobs()
      }
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchPostedJobs()
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posted Jobs</h1>
            <p className="text-gray-600 mt-1">
              Manage your job postings
            </p>
          </div>
          <Link href="/jobs/post">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Post New Job
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {jobs.filter(j => j.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold text-blue-600">
              {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-purple-600">
              {jobs.reduce((sum, job) => sum + (job.views_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {job.title}
                        </h3>
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {job.is_featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{job.category} • {job.job_type?.replace('_', ' ')}</p>
                      <p>{job.city}, {job.country}</p>
                      <p>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
                      {job.deadline && (
                        <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-3 text-sm">
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {job.views_count || 0} views
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {job.applications_count || 0} applications
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/dashboard/applications?jobId=${job.id}`}>
                      <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap">
                        View Applications
                      </button>
                    </Link>
                    <button
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                      className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                        job.is_active
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {job.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link href={`/jobs/edit/${job.id}`}>
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted</h3>
            <p className="text-gray-500 mb-4">
              Start by posting your first job
            </p>
            <Link href="/jobs/post">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Post New Job
              </button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}