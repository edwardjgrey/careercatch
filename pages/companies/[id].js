// pages/companies/[id].js - Individual company profile page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import JobCard from '../../components/JobCard'

export default function CompanyProfile() {
  const router = useRouter()
  const { id } = router.query
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    if (id) {
      fetchCompanyData()
    }
  }, [id])

  const fetchCompanyData = async () => {
    try {
      // Fetch company details
      const companyRes = await fetch(`/api/companies/${id}`)
      const companyData = await companyRes.json()
      setCompany(companyData.company)

      // Fetch company jobs
      const jobsRes = await fetch(`/api/companies/${id}/jobs`)
      const jobsData = await jobsRes.json()
      setJobs(jobsData.jobs || [])
    } catch (error) {
      console.error('Error fetching company:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!company) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600 mb-4">This company profile doesn't exist or has been removed.</p>
            <Link href="/companies">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Browse All Companies
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Company Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl">
                    {company.name.charAt(0)}
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.is_verified && (
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{company.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {company.industry && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {company.industry}
                      </div>
                    )}
                    
                    {company.size && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {company.size} employees
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {company.city}, {company.country}
                    </div>
                    
                    {company.founded_year && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Founded {company.founded_year}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Jobs ({jobs.filter(j => j.is_active).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {company.description || 'No detailed description available.'}
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Company Stats</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
                      <div className="text-sm text-gray-600">Total Jobs Posted</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {jobs.filter(j => j.is_active).length}
                      </div>
                      <div className="text-sm text-gray-600">Active Openings</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Applications</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    {company.email && (
                      <div>
                        <p className="text-gray-500">Email</p>
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                          {company.email}
                        </a>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-700">
                          {company.phone}
                        </a>
                      </div>
                    )}
                    
                    {company.address && (
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p className="text-gray-900">{company.address}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="text-gray-900">{company.city}, {company.country}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Apply */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Work at {company.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Join our team and be part of something great!
                  </p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Open Positions
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Open Positions at {company.name}</h2>
                <p className="text-gray-600">
                  {jobs.filter(j => j.is_active).length} active job openings
                </p>
              </div>

              {jobs.filter(j => j.is_active).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.filter(j => j.is_active).map(job => (
                    <JobCard key={job.id} job={{...job, company_name: company.name}} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Positions</h3>
                  <p className="text-gray-500">
                    This company doesn't have any open positions right now.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}