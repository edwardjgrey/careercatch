// components/ApplicationModal.js - Job application modal
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function ApplicationModal({ isOpen, onClose, job }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    salaryCurrency: job?.salary_currency || 'USD',
    availableFrom: '',
    resumeUrl: '',
    phone: session?.user?.phone || '',
    linkedIn: ''
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          companyId: job.company_id,
          coverLetter: formData.coverLetter,
          expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : null,
          salaryCurrency: formData.salaryCurrency,
          availableFrom: formData.availableFrom || null,
          resumeUrl: formData.resumeUrl || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        router.push('/dashboard/applications')
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {success ? (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-sm text-gray-500">Redirecting to your applications...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Apply for {job?.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    at {job?.company_name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!session ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Please login to apply for this job</p>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Login to Apply
                  </button>
                </div>
              ) : session.user.role === 'employer' ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Employers cannot apply for jobs</p>
                  <p className="text-sm text-gray-400 mt-2">Please use a job seeker account</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Cover Letter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter *
                      </label>
                      <textarea
                        name="coverLetter"
                        rows="5"
                        required
                        value={formData.coverLetter}
                        onChange={handleChange}
                        placeholder="Explain why you're a great fit for this position..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Expected Salary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Salary
                        </label>
                        <input
                          type="number"
                          name="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={handleChange}
                          placeholder="Amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USD">USD</option>
                          <option value="KGS">KGS</option>
                          <option value="KZT">KZT</option>
                          <option value="UZS">UZS</option>
                          <option value="TJS">TJS</option>
                        </select>
                      </div>
                    </div>

                    {/* Available From */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available From
                      </label>
                      <input
                        type="date"
                        name="availableFrom"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Resume URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume/CV Link (optional)
                      </label>
                      <input
                        type="url"
                        name="resumeUrl"
                        value={formData.resumeUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Link to your resume on Google Drive, Dropbox, etc.
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
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

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn Profile (optional)
                      </label>
                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}