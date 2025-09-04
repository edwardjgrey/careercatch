// pages/jobs/index.js - Jobs listing page with filters and search
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import JobCard from '../../components/JobCard'
import { JOB_CATEGORIES, LOCATIONS } from '../../lib/constants'

export default function Jobs() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  
  const jobsPerPage = 12

  useEffect(() => {
    // Get query params from URL
    const { q, category, location, type, page } = router.query
    if (q) setSearchTerm(q)
    if (category) setSelectedCategory(category)
    if (location) setSelectedLocation(location)
    if (type) setSelectedType(type)
    if (page) setCurrentPage(parseInt(page))
  }, [router.query])

  useEffect(() => {
    fetchJobs()
  }, [currentPage, searchTerm, selectedCategory, selectedLocation, selectedType, selectedLevel, isRemote, sortBy])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: jobsPerPage,
        offset: (currentPage - 1) * jobsPerPage,
        sort: sortBy
      })
      
      if (searchTerm) params.append('q', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedLocation) params.append('location', selectedLocation)
      if (selectedType) params.append('type', selectedType)
      if (selectedLevel) params.append('level', selectedLevel)
      if (isRemote) params.append('remote', 'true')

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchJobs()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedLocation('')
    setSelectedType('')
    setSelectedLevel('')
    setIsRemote(false)
    setSortBy('newest')
    setCurrentPage(1)
    router.push('/jobs')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${total} jobs available`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Keywords..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </form>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    <optgroup label="Kyrgyzstan">
                      {LOCATIONS.kyrgyzstan.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Kazakhstan">
                      {LOCATIONS.kazakhstan.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Uzbekistan">
                      {LOCATIONS.uzbekistan.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tajikistan">
                      {LOCATIONS.tajikistan.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Job Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                {/* Remote Only */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remote Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              {/* Sort Bar */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {jobs.length > 0 ? (currentPage - 1) * jobsPerPage + 1 : 0} - {Math.min(currentPage * jobsPerPage, total)} of {total} jobs
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="salary">Highest Salary</option>
                  </select>
                </div>
              </div>

              {/* Jobs Grid */}
              {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {jobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <button
                              key={i}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ky', ['common'])),
    },
  }
}