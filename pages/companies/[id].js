// pages/companies/[id].js - Enhanced company profile page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import JobCard from '../../components/JobCard'
import { formatDistanceToNow } from 'date-fns'

export default function CompanyProfile() {
  const router = useRouter()
  const { data: session } = useSession()
  const { id } = router.query
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      fetchCompanyData()
    }
  }, [id])

  const fetchCompanyData = async () => {
    try {
      const companyRes = await fetch(`/api/companies/${id}`)
      const companyData = await companyRes.json()
      setCompany(companyData.company)

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
            <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
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

  const activeJobs = jobs.filter(job => job.is_active)
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Company Header with Cover */}
        <div className="bg-white">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative">
            {company.cover_image_url && (
              <img 
                src={company.cover_image_url} 
                alt={company.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Company Info Section */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative -mt-16 mb-6">
              <div className="flex items-end space-x-6">
                {/* Company Logo */}
                <div className="relative">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="h-32 w-32 rounded-lg object-cover bg-white p-2 shadow-lg"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-blue-600 font-bold text-4xl">
                      {company.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Company Name and Basic Info */}
                <div className="flex-1 pb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                        {company.tagline && (
                          <p className="text-lg text-gray-600 mt-1">{company.tagline}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {company.industry && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {company.industry}
                            </span>
                          )}
                          {company.size && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {company.size} employees
                            </span>
                          )}
                          {company.founded_year && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Founded {company.founded_year}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
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
                            Website
                          </a>
                        )}
                        {session?.user?.role === 'job_seeker' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="max-w-7xl mx-auto px-4 pb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
                  <div className="text-sm text-gray-600">Total Jobs Posted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{activeJobs.length}</div>
                  <div className="text-sm text-gray-600">Active Openings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalApplications}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {company.response_rate || 95}%
                  </div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm">
            <nav className="flex border-b">
              {['overview', 'jobs', 'about', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'jobs' ? `Jobs (${activeJobs.length})` : tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Company Description */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {company.description || 'No detailed description available.'}
                  </p>
                </div>

                {/* Why Work Here */}
                {company.culture_description && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Why Work Here</h2>
                    <p className="text-gray-600 whitespace-pre-line">{company.culture_description}</p>
                  </div>
                )}

                {/* Benefits */}
                {company.benefits && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {company.benefits.split(',').map((benefit, index) => (
                        <div key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{benefit.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Quick Facts */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Facts</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Headquarters</dt>
                      <dd className="text-gray-900">{company.city}, {company.country}</dd>
                    </div>
                    {company.industry && (
                      <div>
                        <dt className="text-sm text-gray-500">Industry</dt>
                        <dd className="text-gray-900">{company.industry}</dd>
                      </div>
                    )}
                    {company.size && (
                      <div>
                        <dt className="text-sm text-gray-500">Company Size</dt>
                        <dd className="text-gray-900">{company.size} employees</dd>
                      </div>
                    )}
                    {company.founded_year && (
                      <div>
                        <dt className="text-sm text-gray-500">Founded</dt>
                        <dd className="text-gray-900">{company.founded_year}</dd>
                      </div>
                    )}
                    {company.specialties && (
                      <div>
                        <dt className="text-sm text-gray-500 mb-2">Specialties</dt>
                        <dd className="flex flex-wrap gap-1">
                          {company.specialties.split(',').map((specialty, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {specialty.trim()}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Recent Job Postings */}
                {activeJobs.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Openings</h3>
                    <div className="space-y-3">
                      {activeJobs.slice(0, 3).map(job => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                          <div className="cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded">
                            <h4 className="font-medium text-gray-900 hover:text-blue-600">{job.title}</h4>
                            <p className="text-sm text-gray-500">{job.city} • {job.job_type?.replace('_', ' ')}</p>
                          </div>
                        </Link>
                      ))}
                      {activeJobs.length > 3 && (
                        <button
                          onClick={() => setActiveTab('jobs')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View all {activeJobs.length} jobs →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {activeJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeJobs.map(job => (
                    <JobCard key={job.id} job={{...job, company_name: company.name}} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Positions</h3>
                  <p className="text-gray-500">Check back later for new opportunities.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Company Overview</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {company.description || 'No detailed description available.'}
                  </p>
                </div>

                {company.mission && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-600">{company.mission}</p>
                  </div>
                )}

                {company.vision && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h2>
                    <p className="text-gray-600">{company.vision}</p>
                  </div>
                )}
              </div>

              <div>
                {company.tech_stack && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.tech_stack.split(',').map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <dl className="space-y-4">
                  {company.email && (
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="mt-1">
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                          {company.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="mt-1">
                        <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-700">
                          {company.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {company.website && (
                    <div>
                      <dt className="text-sm text-gray-500">Website</dt>
                      <dd className="mt-1">
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          {company.website}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="mt-1 text-gray-900">
                      {company.address && <div>{company.address}</div>}
                      <div>{company.city}, {company.country}</div>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Office Locations</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Headquarters</p>
                      <p className="text-sm text-gray-600">{company.city}, {company.country}</p>
                    </div>
                  </div>
                  {company.other_locations && (
                    company.other_locations.split(',').map((location, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600">{location.trim()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}