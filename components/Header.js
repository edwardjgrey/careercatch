// components/Header.js - Header with simple translation system
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslations } from '../lib/translations'  // FIXED: Import from your translations file

export default function Header() {
  const t = useTranslations()  // Now this will work!
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [, forceUpdate] = useState({})
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    // Listen for language changes
    const handleLangChange = () => {
      forceUpdate({}) // Force re-render when language changes
    }
    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    setShowDropdown(false)
    await signOut({ callbackUrl: '/' })
  }

  const handleNavigation = (path) => {
    setShowDropdown(false)
    setShowMobileMenu(false)
    router.push(path)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <span className="text-2xl font-bold text-blue-600">Career</span>
              <span className="text-2xl font-bold text-gray-800">Catch</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/jobs">
              <span className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
                {t('nav.findJobs')}
              </span>
            </Link>
            
            {session?.user?.role === 'employer' && (
              <Link href="/jobs/post">
                <span className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
                  {t('nav.postJob')}
                </span>
              </Link>
            )}

            <Link href="/companies">
              <span className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
                {t('nav.companies')}
              </span>
            </Link>

            <LanguageSwitcher />

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    {session.user.firstName?.[0] || session.user.email[0].toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {session.user.firstName || session.user.email.split('@')[0]}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                      <p className="text-xs text-blue-600 mt-1 capitalize">
                        {session.user.role === 'employer' ? 'Employer' : 'Job Seeker'}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('nav.dashboard')}
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('nav.profile')}
                      </button>
                      
                      {session.user.role === 'job_seeker' && (
                        <>
                          <button
                            onClick={() => handleNavigation('/dashboard/applications')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('nav.applications')}
                          </button>
                          <button
                            onClick={() => handleNavigation('/dashboard/saved-jobs')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('nav.savedJobs')}
                          </button>
                        </>
                      )}
                      
                      {session.user.role === 'employer' && (
                        <>
                          <button
                            onClick={() => handleNavigation('/dashboard/posted-jobs')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('nav.postedJobs')}
                          </button>
                          <button
                            onClick={() => handleNavigation('/dashboard/applications')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t('nav.applications')}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleNavigation('/settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('nav.settings')}
                      </button>
                    </div>
                    
                    <div className="border-t py-1">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <span className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
                    {t('nav.signIn')}
                  </span>
                </Link>
                <Link href="/auth/register">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                    {t('nav.signUp')}
                  </button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleNavigation('/jobs')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {t('nav.findJobs')}
              </button>
              
              {session?.user?.role === 'employer' && (
                <button
                  onClick={() => handleNavigation('/jobs/post')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {t('nav.postJob')}
                </button>
              )}
              
              <button
                onClick={() => handleNavigation('/companies')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {t('nav.companies')}
              </button>

              {session ? (
                <>
                  <div className="border-t pt-2 mt-2">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      {t('nav.dashboard')}
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <button
                    onClick={() => handleNavigation('/auth/login')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => handleNavigation('/auth/register')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}