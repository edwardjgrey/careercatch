// components/AnalyticsDashboard.js - Advanced analytics for users
import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function AnalyticsDashboard({ userRole, userId }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30days')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?range=${dateRange}`)
      const data = await res.json()
      setAnalyticsData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'employer' ? 'Track your job postings and candidate engagement' : 'Monitor your job search progress'}
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Period:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="365days">Last Year</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <nav className="flex border-b">
          {['overview', 'performance', 'engagement', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
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

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {userRole === 'employer' ? (
              <>
                <MetricCard
                  title="Total Views"
                  value={analyticsData?.totalViews || 0}
                  change={analyticsData?.viewsChange || 0}
                  icon="👁️"
                />
                <MetricCard
                  title="Applications"
                  value={analyticsData?.totalApplications || 0}
                  change={analyticsData?.applicationsChange || 0}
                  icon="📋"
                />
                <MetricCard
                  title="Avg. Time to Fill"
                  value={`${analyticsData?.avgTimeToFill || 0} days`}
                  change={analyticsData?.timeToFillChange || 0}
                  icon="⏱️"
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${analyticsData?.conversionRate || 0}%`}
                  change={analyticsData?.conversionChange || 0}
                  icon="📈"
                />
              </>
            ) : (
              <>
                <MetricCard
                  title="Applications Sent"
                  value={analyticsData?.applicationsSent || 0}
                  change={analyticsData?.applicationsChange || 0}
                  icon="📤"
                />
                <MetricCard
                  title="Response Rate"
                  value={`${analyticsData?.responseRate || 0}%`}
                  change={analyticsData?.responseChange || 0}
                  icon="💬"
                />
                <MetricCard
                  title="Profile Views"
                  value={analyticsData?.profileViews || 0}
                  change={analyticsData?.viewsChange || 0}
                  icon="👤"
                />
                <MetricCard
                  title="Saved Jobs"
                  value={analyticsData?.savedJobs || 0}
                  change={analyticsData?.savedChange || 0}
                  icon="⭐"
                />
              </>
            )}
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Applications Over Time' : 'Activity Trend'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Performance by Job Type' : 'Applications by Category'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.categoryPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Hiring Funnel' : 'Application Status'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analyticsData?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performing Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Top Performing Jobs' : 'Most Viewed Jobs'}
            </h3>
            <div className="space-y-3">
              {(analyticsData?.topPerformers || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.metric}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Source Performance' : 'Response Times'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.comparisonData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#3B82F6" name="Current Period" />
                <Line type="monotone" dataKey="previous" stroke="#9CA3AF" name="Previous Period" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* Engagement Heatmap */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Heatmap</h3>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs text-gray-600 font-medium p-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
              {(analyticsData?.heatmapData || []).map((value, index) => (
                <div
                  key={index}
                  className={`h-8 rounded flex items-center justify-center text-xs ${
                    value > 75 ? 'bg-blue-600 text-white' :
                    value > 50 ? 'bg-blue-400 text-white' :
                    value > 25 ? 'bg-blue-200' :
                    'bg-gray-100'
                  }`}
                  title={`${value} activities`}
                >
                  {value > 0 ? value : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Times</h3>
              <div className="space-y-2">
                {(analyticsData?.peakTimes || []).map((time, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{time.period}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${time.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{time.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#3B82F6"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(analyticsData?.engagementScore || 0) * 3.51} 351.86`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{analyticsData?.engagementScore || 0}</p>
                      <p className="text-xs text-gray-500">out of 100</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
              <div className="space-y-2">
                {(analyticsData?.activityBreakdown || []).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{activity.icon}</span>
                      <span className="text-sm text-gray-600">{activity.type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{activity.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-xl font-bold mb-4">🤖 AI-Powered Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analyticsData?.aiInsights || []).map((insight, index) => (
                <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{insight.icon}</span>
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.description}</p>
                      {insight.action && (
                        <button className="mt-2 text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-opacity-90">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-4">
              {(analyticsData?.recommendations || []).map((rec, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    rec.priority === 'high' ? 'bg-red-100' :
                    rec.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <span className="text-lg">{rec.icon}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">{rec.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'employer' ? 'Market Comparison' : 'Your Performance vs Average'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.competitiveData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="you" fill="#3B82F6" name="You" />
                <Bar dataKey="average" fill="#9CA3AF" name="Market Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// MetricCard Component
function MetricCard({ title, value, change, icon }) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}