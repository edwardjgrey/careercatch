// pages/companies/index.js - Browse all companies
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Companies() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      const data = await res.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry
    const matchesSize = !selectedSize || company.size === selectedSize
    
    return matchesSearch && matchesIndustry && matchesSize
  })

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort()
  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+']

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Companies Hiring</h1>
            <p className="text-gray-600 mt-1">
              Discover companies and explore their job opportunities
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sizes</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-gray-600">
            Showing {filteredCompanies.length} of {companies.length} companies
          </div>

          {/* Companies Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Link key={company.id} href={`/companies/${company.slug || company.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">
                          {company.name.charAt(0)}
                        </div>
                      )}
                      {company.is_verified && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h3>
                    
                    {company.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-500">
                      {company.industry && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {company.industry}
                        </div>
                      )}
                      
                      {company.size && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {company.size} employees
                        </div>
                      )}

                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {company.city}, {company.country}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-600">
                        {company.active_jobs_count || 0} open positions
                      </span>
                      <span className="text-sm text-gray-500">
                        View company →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
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