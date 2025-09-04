// pages/dashboard/index.js - Main dashboard with role-based content
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next';
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    profileViews: 0,
    postedJobs: 0,
    totalApplications: 0,
    activeJobs: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session) {
      fetchDashboardData()
    }
  }, [session, status])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data.stats || {})
      setRecentActivity(data.recentActivity || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const isEmployer = session?.user?.role === 'employer'

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.firstName || session?.user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isEmployer ? 'Manage your job postings and applications' : 'Track your job search progress'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {isEmployer ? (
            <>
              <Link href="/jobs/post">
                <div className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="font-semibold">Post New Job</div>
                </div>
              </Link>
              <Link href="/dashboard/posted-jobs">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="font-semibold text-gray-900">Manage Jobs</div>
                </div>
              </Link>
              <Link href="/dashboard/applications">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="font-semibold text-gray-900">Applications</div>
                </div>
              </Link>
              <Link href={`/companies/${session?.user?.companySlug || session?.user?.companyId}`}>
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="font-semibold text-gray-900">Company Profile</div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/jobs">
                <div className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="font-semibold">Find Jobs</div>
                </div>
              </Link>
              <Link href="/dashboard/applications">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="font-semibold text-gray-900">Applications</div>
                </div>
              </Link>
              <Link href="/dashboard/saved-jobs">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div className="font-semibold text-gray-900">Saved Jobs</div>
                </div>
              </Link>
              <Link href="/profile">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-600 cursor-pointer transition">
                  <svg className="w-8 h-8 mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="font-semibold text-gray-900">My Profile</div>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isEmployer ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeJobs || 0}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Currently posted positions</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Received this month</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingReview || 0}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Applications to review</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.applications || 0}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Total job applications</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.savedJobs || 0}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Jobs bookmarked</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.profileViews || 0}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">This month</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        activity.type === 'application' ? 'bg-blue-600' :
                        activity.type === 'view' ? 'bg-green-600' :
                        activity.type === 'saved' ? 'bg-purple-600' :
                        'bg-gray-600'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    {activity.link && (
                      <Link href={activity.link}>
                        <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                          View →
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No recent activity to display</p>
                <Link href="/jobs">
                  <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                    {isEmployer ? 'Post your first job' : 'Start browsing jobs'}
                  </button>
                </Link>
              </div>
            )}
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