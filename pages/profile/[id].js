// pages/profile/[id].js - Complete personal job seeker profile page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { formatDistanceToNow } from 'date-fns'

export default function PersonalProfile() {
  const router = useRouter()
  const { data: session } = useSession()
  const { id } = router.query
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadingImage, setUploadingImage] = useState(false)
  const isOwnProfile = session?.user?.id === id

  useEffect(() => {
    if (id) {
      fetchProfileData()
    }
  }, [id])

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`/api/users/profile/${id}`)
      const data = await res.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type) // 'avatar' or 'cover'

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        // Update profile with new image URL
        setProfile(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatar_url' : 'cover_image_url']: data.url
        }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">This profile doesn't exist or has been removed.</p>
            <Link href="/jobs">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Browse Jobs
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const getAvailabilityBadge = () => {
    if (profile.is_open_to_work) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          Open to Work
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
        Not actively looking
      </span>
    )
  }

  const getExperienceLevel = (years) => {
    if (!years) return 'Entry Level'
    if (years < 2) return 'Junior'
    if (years < 5) return 'Mid-Level'
    if (years < 10) return 'Senior'
    return 'Expert'
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Profile Header with Cover */}
        <div className="bg-white">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            {profile.cover_image_url ? (
              <img 
                src={profile.cover_image_url} 
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
            )}
            {isOwnProfile && (
              <label className="absolute top-4 right-4 px-3 py-1 bg-white bg-opacity-90 rounded-md text-sm font-medium hover:bg-opacity-100 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                  disabled={uploadingImage}
                />
                {uploadingImage ? 'Uploading...' : 'Edit Cover'}
              </label>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative -mt-16 mb-6">
              <div className="flex items-end space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.first_name}
                      className="h-32 w-32 rounded-full object-cover bg-white p-1 shadow-lg"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-white rounded-full shadow-lg flex items-center justify-center text-4xl font-bold text-gray-400">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  )}
                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:shadow-lg cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                        disabled={uploadingImage}
                      />
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>

                {/* Name and Basic Info */}
                <div className="flex-1 pb-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </h1>
                        {profile.headline && (
                          <p className="text-xl text-gray-700 mt-1">{profile.headline}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {profile.current_position && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {profile.current_position}
                              {profile.current_company && ` at ${profile.current_company}`}
                            </span>
                          )}
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profile.city}, {profile.country}
                          </span>
                          {profile.experience_years && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {profile.experience_years} years experience
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          {getAvailabilityBadge()}
                          {profile.is_remote_ready && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              Remote Ready
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {isOwnProfile ? (
                          <Link href="/profile">
                            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                              Edit Profile
                            </button>
                          </Link>
                        ) : (
                          <>
                            {session?.user?.role === 'employer' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                  Message
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                  Save Profile
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="max-w-5xl mx-auto px-4 pb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getExperienceLevel(profile.experience_years)}
                  </div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.skills?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {profile.languages?.length || 1}
                  </div>
                  <div className="text-sm text-gray-600">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {profile.certifications?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Certifications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {profile.projects?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="max-w-5xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm">
            <nav className="flex border-b">
              {['overview', 'experience', 'skills', 'education', 'portfolio'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto px-4 pb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {profile.summary || 'No summary available.'}
                  </p>
                </div>

                {/* Experience Highlights */}
                {profile.experience && profile.experience.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Experience Highlights</h2>
                    <div className="space-y-4">
                      {profile.experience.slice(0, 2).map((exp, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900">{exp.title}</h3>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">{exp.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {profile.experience.length > 2 && (
                      <button
                        onClick={() => setActiveTab('experience')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all experience →
                      </button>
                    )}
                  </div>
                )}

                {/* Key Achievements */}
                {profile.achievements && profile.achievements.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Key Achievements</h2>
                    <ul className="space-y-2">
                      {profile.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Contact Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
                  <dl className="space-y-3">
                    {(profile.email_visible || isOwnProfile) && profile.email && (
                      <div>
                        <dt className="text-sm text-gray-500">Email</dt>
                        <dd className="text-gray-900">{profile.email}</dd>
                      </div>
                    )}
                    {(profile.phone_visible || isOwnProfile) && profile.phone && (
                      <div>
                        <dt className="text-sm text-gray-500">Phone</dt>
                        <dd className="text-gray-900">{profile.phone}</dd>
                      </div>
                    )}
                    {profile.linkedin && (
                      <div>
                        <dt className="text-sm text-gray-500">LinkedIn</dt>
                        <dd>
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            View Profile
                          </a>
                        </dd>
                      </div>
                    )}
                    {profile.github && (
                      <div>
                        <dt className="text-sm text-gray-500">GitHub</dt>
                        <dd>
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            View Profile
                          </a>
                        </dd>
                      </div>
                    )}
                    {profile.portfolio && (
                      <div>
                        <dt className="text-sm text-gray-500">Portfolio</dt>
                        <dd>
                          <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            View Portfolio
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                  {!isOwnProfile && session?.user?.role === 'employer' && (
                    <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Send Message
                    </button>
                  )}
                </div>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Languages</h3>
                    <div className="space-y-2">
                      {profile.languages.map((lang, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700">
                            {typeof lang === 'string' ? lang : lang.name}
                          </span>
                          {typeof lang === 'object' && lang.proficiency && (
                            <span className="text-sm text-gray-500">{lang.proficiency}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Preferences */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Work Preferences</h3>
                  <dl className="space-y-3 text-sm">
                    {profile.preferred_job_types && profile.preferred_job_types.length > 0 && (
                      <div>
                        <dt className="text-gray-500">Job Types</dt>
                        <dd className="text-gray-900">{profile.preferred_job_types.join(', ')}</dd>
                      </div>
                    )}
                    {(isOwnProfile || session?.user?.role === 'employer') && profile.desired_salary_min && (
                      <div>
                        <dt className="text-gray-500">Salary Expectation</dt>
                        <dd className="text-gray-900">
                          {profile.salary_currency || '$'}{profile.desired_salary_min.toLocaleString()}
                          {profile.desired_salary_max && ` - ${profile.salary_currency || '$'}${profile.desired_salary_max.toLocaleString()}`}
                        </dd>
                      </div>
                    )}
                    {profile.willing_to_relocate !== undefined && (
                      <div>
                        <dt className="text-gray-500">Relocation</dt>
                        <dd className="text-gray-900">
                          {profile.willing_to_relocate ? 'Open to relocation' : 'Not looking to relocate'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Work Experience</h2>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="relative">
                        {index !== profile.experience.length - 1 && (
                          <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        <div className="flex">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                            <p className="text-gray-700">{exp.company}</p>
                            <p className="text-sm text-gray-500">{exp.duration} • {exp.location}</p>
                            {exp.description && (
                              <p className="mt-2 text-gray-600">{exp.description}</p>
                            )}
                            {exp.achievements && exp.achievements.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-start">
                                    <span className="text-gray-400 mr-2">•</span>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No experience information available.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Technical Skills */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Skills</h2>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills listed.</p>
                  )}
                </div>

                {/* Soft Skills */}
                {profile.soft_skills && profile.soft_skills.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Soft Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.soft_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools & Technologies */}
                {profile.tools && profile.tools.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tools & Technologies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {profile.tools.map((tool, index) => (
                        <div key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {/* Skill Levels */}
                {profile.skill_levels && Object.keys(profile.skill_levels).length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Proficiency</h3>
                    <div className="space-y-3">
                      {Object.entries(profile.skill_levels).map(([skill, level]) => (
                        <div key={skill}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{skill}</span>
                            <span className="text-gray-500">{level}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Education</h2>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-6">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-700">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.year} • {edu.location}</p>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                          )}
                          {edu.description && (
                            <p className="mt-2 text-gray-600">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education information available.</p>
                )}
              </div>

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
                  <div className="space-y-4">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {typeof cert === 'string' ? cert : cert.name}
                          </h4>
                          {typeof cert === 'object' && (
                            <>
                              {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
                              {cert.date && <p className="text-sm text-gray-500">{cert.date}</p>}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Projects */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
                {profile.projects && profile.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                        {project.image && (
                          <img src={project.image} alt={project.title} className="w-full h-32 object-cover rounded mb-3" />
                        )}
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies?.map((tech, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                              View →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No portfolio projects available.</p>
                )}
              </div>

              {/* Publications */}
              {profile.publications && profile.publications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Publications</h2>
                  <div className="space-y-4">
                    {profile.publications.map((pub, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-medium text-gray-900">{pub.title}</h4>
                        <p className="text-sm text-gray-600">{pub.journal || pub.conference}</p>
                        <p className="text-sm text-gray-500">{pub.date}</p>
                        {pub.link && (
                          <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                            Read Publication →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards & Recognition */}
              {profile.awards && profile.awards.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
                  <div className="space-y-3">
                    {profile.awards.map((award, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-gray-900">{award.title}</h4>
                          {award.issuer && <p className="text-sm text-gray-600">{award.issuer}</p>}
                          {award.date && <p className="text-sm text-gray-500">{award.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}