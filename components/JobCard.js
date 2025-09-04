// components/JobCard.js - Enhanced job card component
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function JobCard({ job }) {
  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Salary not specified'
    if (job.hide_salary) return 'Competitive salary'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    return min ? `From ${formatter.format(min)}` : `Up to ${formatter.format(max)}`
  }

  const getJobTypeColor = (type) => {
    const colors = {
      full_time: 'bg-green-100 text-green-800',
      part_time: 'bg-blue-100 text-blue-800',
      contract: 'bg-yellow-100 text-yellow-800',
      internship: 'bg-purple-100 text-purple-800',
      freelance: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatJobType = (type) => {
    return type ? type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') : 'Full Time'
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link href={`/jobs/${job.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
              {job.title}
            </h3>
          </Link>
          <Link href={`/companies/${job.company_slug || job.company_id}`}>
            <p className="text-gray-600 hover:text-blue-600 cursor-pointer mt-1">
              {job.company_name || 'Company Name'}
            </p>
          </Link>
        </div>
        {job.is_featured && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
          {formatJobType(job.job_type)}
        </span>
        
        {job.is_remote && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
            Remote
          </span>
        )}
        
        {job.experience_level && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)} Level
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.city}, {job.country}
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </div>

        {job.category && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {job.category}
          </div>
        )}
      </div>

      {job.skills_required && job.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {job.skills_required.slice(0, 3).map((skill, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
          {job.skills_required.length > 3 && (
            <span className="text-xs text-gray-500 py-1">
              +{job.skills_required.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </span>
        <Link href={`/jobs/${job.id}`}>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View Details →
          </button>
        </Link>
      </div>
    </div>
  )
}