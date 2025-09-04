// pages/companies/edit.js - Complete company profile edit page for employers
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { LOCATIONS } from '../../lib/constants'

export default function CompanyProfileEdit() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    tagline: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    
    // Location
    country: '',
    city: '',
    address: '',
    other_locations: '',
    
    // Company Details
    industry: '',
    size: '',
    founded_year: '',
    
    // Culture & Benefits
    culture_description: '',
    benefits: '',
    mission: '',
    vision: '',
    
    // Technical
    tech_stack: '',
    specialties: '',
    
    // Images
    logo_url: '',
    cover_image_url: '',
    
    // Social
    linkedin_url: '',
    twitter_url: '',
    facebook_url: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'employer') {
      router.push('/dashboard')
    } else if (session) {
      fetchCompanyProfile()
    }
  }, [session, status])

  const fetchCompanyProfile = async () => {
    try {
      const res = await fetch('/api/companies/profile')
      const data = await res.json()
      if (data.company) {
        setFormData(prev => ({
          ...prev,
          ...data.company,
          benefits: data.company.benefits ? 
            (Array.isArray(data.company.benefits) ? data.company.benefits.join(', ') : data.company.benefits) : '',
          tech_stack: data.company.tech_stack ? 
            (Array.isArray(data.company.tech_stack) ? data.company.tech_stack.join(', ') : data.company.tech_stack) : '',
          specialties: data.company.specialties ? 
            (Array.isArray(data.company.specialties) ? data.company.specialties.join(', ') : data.company.specialties) : '',
          other_locations: data.company.other_locations ? 
            (Array.isArray(data.company.other_locations) ? data.company.other_locations.join(', ') : data.company.other_locations) : ''
        }))
      }
    } catch (error) {
      console.error('Error fetching company profile:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type) // 'logo' or 'cover'

    try {
      const res = await fetch('/api/upload/company-image', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({
          ...prev,
          [type === 'logo' ? 'logo_url' : 'cover_image_url']: data.url
        }))
        setSuccess('Image uploaded successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Process array fields
      const processedData = {
        ...formData,
        benefits: formData.benefits ? formData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map(s => s.trim()).filter(s => s) : [],
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(s => s) : [],
        other_locations: formData.other_locations ? formData.other_locations.split(',').map(s => s.trim()).filter(s => s) : []
      }

      const res = await fetch('/api/companies/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update company profile')
      }

      setSuccess('Company profile updated successfully!')
      setTimeout(() => {
        router.push(`/companies/${data.company.slug || data.company.id}`)
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
              <div className="h-10 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your company information and attract top talent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Company Images */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Branding</h2>
            
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Company logo" className="h-20 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      disabled={uploadingImage}
                    />
                    <span className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {uploadingImage ? 'Uploading...' : 'Upload Logo'}
                    </span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">Recommended: 200x200px, PNG or JPG</p>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Cover" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    disabled={uploadingImage}
                  />
                  <span className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 inline-block">
                    {uploadingImage ? 'Uploading...' : 'Upload Cover Image'}
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500">Recommended: 1920x400px, PNG or JPG</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">Contact support to change company name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g., Building the future of technology"
                  maxLength="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell candidates about your company..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hr@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    name="founded_year"
                    value={formData.founded_year}
                    onChange={handleChange}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  name="country"
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
                  City
                </label>
                <select
                  name="city"
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
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Suite 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Locations (comma-separated)
              </label>
              <input
                type="text"
                name="other_locations"
                value={formData.other_locations}
                onChange={handleChange}
                placeholder="New York, London, Tokyo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Company Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Energy">Energy</option>
                  <option value="Government">Government</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties (comma-separated)
              </label>
              <input
                type="text"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                placeholder="e.g., Mobile Development, Cloud Computing, AI/ML"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                name="tech_stack"
                value={formData.tech_stack}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, PostgreSQL, AWS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Culture & Values */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Culture & Values</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Culture
                </label>
                <textarea
                  name="culture_description"
                  rows="4"
                  value={formData.culture_description}
                  onChange={handleChange}
                  placeholder="Describe your company culture and work environment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission
                </label>
                <textarea
                  name="mission"
                  rows="2"
                  value={formData.mission}
                  onChange={handleChange}
                  placeholder="What is your company's mission?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision
                </label>
                <textarea
                  name="vision"
                  rows="2"
                  value={formData.vision}
                  onChange={handleChange}
                  placeholder="What is your company's vision?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits & Perks (comma-separated)
                </label>
                <textarea
                  name="benefits"
                  rows="3"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="e.g., Health Insurance, Remote Work, Flexible Hours, 401k, Gym Membership"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}