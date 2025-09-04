// pages/settings/index.js - Account settings page
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Settings() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('account')

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    // TODO: Implement account deletion
    alert('Account deletion is not yet implemented')
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <p className="text-gray-900">{session?.user?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Contact support to change your email address
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <p className="text-gray-900">
                        {session?.user?.role === 'employer' ? 'Employer' : 'Job Seeker'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h3>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete Account
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Email me when someone views my application</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Email me about new job opportunities</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Send me Career Catch newsletter</span>
                    </label>
                  </div>

                  <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Preferences
                  </button>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Profile Visibility</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="visibility"
                            defaultChecked
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2">Public - Anyone can view my profile</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="visibility"
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2">Private - Only employers I apply to can view</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Data Sharing</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Allow Career Catch to share my data with partners</span>
                      </label>
                    </div>
                  </div>

                  <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Privacy Settings
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Update Password
                      </button>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Active Sessions</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Manage your active sessions and sign out from other devices
                      </p>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Sign Out All Devices
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}