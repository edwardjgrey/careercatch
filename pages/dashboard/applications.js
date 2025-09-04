// pages/dashboard/applications.js - Applications tracking page
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { formatDistanceToNow } from 'date-fns'

export default function Applications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session) {
      fetchApplications()
    }
  }, [session, status])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, status, notes = '') => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status,
          notes
        })
      })

      if (res.ok) {
        fetchApplications()
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const isEmployer = session?.user?.role === 'employer'

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEmployer ? 'Received Applications' : 'My Applications'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEmployer 
              ? 'Review and manage applications for your job postings'
              : 'Track the status of your job applications'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Reviewed ({applications.filter(a => a.status === 'reviewed').length})
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-4 py-2 rounded-md ${
              filter === 'shortlisted'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/jobs/${application.job_id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {application.job_title}
                        </h3>
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    
                    {isEmployer ? (
                      <div>
                        <p className="text-gray-600">
                          <strong>Applicant:</strong> {application.first_name} {application.last_name}
                        </p>
                        <p className="text-gray-600">
                          <strong>Email:</strong> {application.applicant_email}
                        </p>
                        {application.applicant_phone && (
                          <p className="text-gray-600">
                            <strong>Phone:</strong> {application.applicant_phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Link href={`/companies/${application.company_slug}`}>
                        <p className="text-gray-600 hover:text-blue-600 cursor-pointer">
                          {application.company_name}
                        </p>
                      </Link>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                    </p>

                    {application.expected_salary && (
                      <p className="text-sm text-gray-600 mt-1">
                        Expected Salary: {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: application.salary_currency || 'USD'
                        }).format(application.expected_salary)}
                      </p>
                    )}

                    {/* Cover Letter Preview */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {application.cover_letter}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {application.resume_url && (
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm text-center border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </div>

                {isEmployer && application.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
            <p className="text-gray-500">
              {isEmployer 
                ? 'You haven\'t received any applications yet'
                : 'You haven\'t applied to any jobs yet'}
            </p>
            {!isEmployer && (
              <Link href="/jobs">
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Browse Jobs
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedApplication(null)} />
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Position</h3>
                  <p className="text-gray-700">{selectedApplication.job_title}</p>
                </div>

                {isEmployer && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Applicant Information</h3>
                    <p className="text-gray-700">
                      {selectedApplication.first_name} {selectedApplication.last_name}
                    </p>
                    <p className="text-gray-700">{selectedApplication.applicant_email}</p>
                    {selectedApplication.applicant_phone && (
                      <p className="text-gray-700">{selectedApplication.applicant_phone}</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900">Cover Letter</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>

                {selectedApplication.expected_salary && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Expected Salary</h3>
                    <p className="text-gray-700">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: selectedApplication.salary_currency || 'USD'
                      }).format(selectedApplication.expected_salary)}
                    </p>
                  </div>
                )}

                {selectedApplication.available_from && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Available From</h3>
                    <p className="text-gray-700">
                      {new Date(selectedApplication.available_from).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>

                {selectedApplication.employer_notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Employer Notes</h3>
                    <p className="text-gray-700">{selectedApplication.employer_notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}