// pages/jobs/post.js - Job posting page for employers
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { JOB_CATEGORIES, LOCATIONS } from '../../lib/constants'

export default function PostJob() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    category: '',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    hide_salary: false,
    country: '',
    city: '',
    address: '',
    is_remote: false,
    is_hybrid: false,
    skills_required: '',
    languages_required: '',
    education_required: '',
    experience_years_min: '',
    experience_years_max: '',
    deadline: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'employer') {
      router.push('/dashboard')
    }
  }, [session, status])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Convert comma-separated skills and languages to arrays
      const skills = formData.skills_required
        ? formData.skills_required.split(',').map(s => s.trim()).filter(s => s)
        : []
      
      const languages = formData.languages_required
        ? formData.languages_required.split(',').map(l => l.trim()).filter(l => l)
        : []

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills_required: skills,
          languages_required: languages,
          company_id: session.user.companyId,
          posted_by: session.user.id,
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
          experience_years_min: formData.experience_years_min ? parseInt(formData.experience_years_min) : null,
          experience_years_max: formData.experience_years_max ? parseInt(formData.experience_years_max) : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post job')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/posted-jobs')
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Get cities based on selected country
  const getCities = () => {
    if (!formData.country) return []
    const countryKey = formData.country.toLowerCase()
    return LOCATIONS[countryKey] || []
  }

  if (status === 'loading') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create your job posting</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-green-800 font-medium">Job posted successfully!</h3>
                <p className="text-green-700 text-sm mt-1">Redirecting to your posted jobs...</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type *
                    </label>
                    <select
                      name="job_type"
                      required
                      value={formData.job_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Country</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Tajikistan">Tajikistan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select City</option>
                    {getCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Office address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remote Position</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_hybrid"
                    checked={formData.is_hybrid}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hybrid Position</span>
                </label>
              </div>
            </div>

            {/* Job Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the position..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows="4"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List the requirements for this position..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities
                  </label>
                  <textarea
                    name="responsibilities"
                    rows="4"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="List the key responsibilities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <textarea
                    name="benefits"
                    rows="3"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="List the benefits and perks..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="salary_currency"
                    value={formData.salary_currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="KGS">KGS (Som)</option>
                    <option value="KZT">KZT (Tenge)</option>
                    <option value="UZS">UZS (Som)</option>
                    <option value="TJS">TJS (Somoni)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hide_salary"
                  checked={formData.hide_salary}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Hide salary information</span>
              </label>
            </div>

            {/* Skills and Requirements */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Requirements</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills_required"
                    value={formData.skills_required}
                    onChange={handleChange}
                    placeholder="e.g. JavaScript, React, Node.js"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Languages (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="languages_required"
                    value={formData.languages_required}
                    onChange={handleChange}
                    placeholder="e.g. English, Russian"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Years Experience
                    </label>
                    <input
                      type="number"
                      name="experience_years_min"
                      value={formData.experience_years_min}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Years Experience
                    </label>
                    <input
                      type="number"
                      name="experience_years_max"
                      value={formData.experience_years_max}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}