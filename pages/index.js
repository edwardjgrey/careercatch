// pages/index.js - Homepage without next-i18next
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import JobCard from '../components/JobCard'
import { JOB_CATEGORIES, LOCATIONS } from '../lib/constants'

export default function Home() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [recentJobs, setRecentJobs] = useState([])
  const [stats, setStats] = useState({ jobs: 0, companies: 0, users: 0 })

  useEffect(() => {
    fetchRecentJobs()
    fetchStats()
  }, [])

  const fetchRecentJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=6')
      const data = await res.json()
      setRecentJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = new URLSearchParams({
      q: searchTerm,
      location: selectedLocation
    }).toString()
    router.push(`/jobs?${query}`)
  }

  // Get all cities from all countries
  const allCities = Object.values(LOCATIONS).flat()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Find Your Dream Job in Central Asia
          </h1>
          <p className="text-xl mb-8">
            Connect with top employers in Kyrgyzstan, Kazakhstan, Uzbekistan, and Tajikistan
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg"
              />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-6 py-4 rounded-lg text-gray-900 text-lg"
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
              <button
                type="submit"
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg text-lg transition"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">{stats.jobs}+</div>
              <div className="text-gray-600 mt-2">Active Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">{stats.companies}+</div>
              <div className="text-gray-600 mt-2">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">{stats.users}+</div>
              <div className="text-gray-600 mt-2">Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {JOB_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => router.push(`/jobs?category=${encodeURIComponent(category)}`)}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-blue-600 text-3xl mb-2">
                  {getCategoryIcon(category)}
                </div>
                <div className="font-medium">{category}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Jobs</h2>
            <button
              onClick={() => router.push('/jobs')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all jobs →
            </button>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-xl mb-8">
            Join thousands of job seekers who found their dream jobs through Career Catch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/register')}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Create Free Account
            </button>
            <button
              onClick={() => router.push('/jobs/post')}
              className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
            >
              Post a Job
            </button>
          </div>
        </div>
      </section>
    </Layout>
  )
}

// Helper function to get category icons (using emoji for simplicity)
function getCategoryIcon(category) {
  const icons = {
    'Technology & IT': '💻',
    'Business & Finance': '💼',
    'Sales & Marketing': '📈',
    'Healthcare & Medical': '⚕️',
    'Education & Training': '📚',
    'Engineering & Manufacturing': '🏭',
    'Transportation & Logistics': '🚚',
    'Creative & Media': '🎨',
    'Hospitality & Tourism': '🏨',
    'Government & Non-Profit': '🏛️'
  }
  return icons[category] || '💼'
}