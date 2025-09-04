// pages/jobs/[id].js - Individual job detail page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import Layout from '../../components/Layout'
import ApplicationModal from '../../components/ApplicationModal'

export default function JobDetail() {
  const router = useRouter()
  const { id } = router.query
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedJobs, setRelatedJobs] = useState([])
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJob()
      fetchRelatedJobs()
    }
  }, [id])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`)
      const data = await res.json()
      setJob(data.job)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?limit=3&exclude=${id}`)
      const data = await res.json()
      setRelatedJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching related jobs:', error)
    }
  }

  const handleSaveJob = async () => {
    // TODO: Implement save job functionality
    setIsSaved(!isSaved)
  }

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Salary not specified'
    if (job?.hide_salary) return 'Competitive salary'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    return min ? `From ${formatter.format(min)}` : `Up to ${formatter.format(max)}`
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4">Loading job details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
            <p className="mt-2 text-gray-600">This job posting may have been removed or is no longer available.</p>
            <Link href="/jobs">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Browse All Jobs
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Job Header */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <Link href={`/companies/${job.company_slug || job.company_id}`}>
                      <p className="text-xl text-blue-600 hover:text-blue-700 cursor-pointer">
                        {job.company_name}
                      </p>
                    </Link>
                  </div>
                  <button
                    onClick={handleSaveJob}
                    className={`p-2 rounded-full ${isSaved ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.city}, {job.country}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.job_type?.replace('_', ' ').charAt(0).toUpperCase() + job.job_type?.slice(1).replace('_', ' ')}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.is_remote && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      Remote
                    </span>
                  )}
                  {job.is_hybrid && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Hybrid
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} Level
                    </span>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
                  <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {job.benefits}
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Apply Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6 sticky top-4">
                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </div>
                  <div className="text-gray-600">per {job.job_type === 'contract' ? 'contract' : 'year'}</div>
                </div>

              <button onClick={() => setShowApplicationModal(true)} className="...">
                  Apply Now
                </button>

                {/* Add Message Button */}
                {session?.user?.role === 'job_seeker' && (
                  <MessageButton 
                    recipientId={job.posted_by}
                    recipientName={job.company_name}
                    jobTitle={job.title}
                  />
                )}

                <button
                  onClick={handleSaveJob}
                  className="w-full px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>

                {job.deadline && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Application deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Company Info Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About the Company</h3>
                <Link href={`/companies/${job.company_slug || job.company_id}`}>
                  <div className="cursor-pointer">
                    <h4 className="text-blue-600 hover:text-blue-700 font-semibold">
                      {job.company_name}
                    </h4>
                  </div>
                </Link>
                {job.company_industry && (
                  <p className="text-sm text-gray-600 mt-2">Industry: {job.company_industry}</p>
                )}
                {job.company_size && (
                  <p className="text-sm text-gray-600">Company size: {job.company_size} employees</p>
                )}
                <Link href={`/companies/${job.company_slug || job.company_id}`}>
                  <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Company Profile →
                  </button>
                </Link>
              </div>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-4">
                    {relatedJobs.map(relJob => (
                      <Link key={relJob.id} href={`/jobs/${relJob.id}`}>
                        <div className="cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded">
                          <h4 className="font-medium text-gray-900 hover:text-blue-600">
                            {relJob.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{relJob.company_name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {relJob.city}, {relJob.country}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal 
        isOpen={showApplicationModal} 
        onClose={() => setShowApplicationModal(false)}
        job={job}
      />
    </Layout>
  )
}