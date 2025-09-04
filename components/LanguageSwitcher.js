// components/LanguageSwitcher.js - Simple language switcher without i18n dependency
import { useState, useRef, useEffect } from 'react'

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('ky') // Kyrgyz default
  const dropdownRef = useRef(null)

  const languages = {
    ky: { name: 'Кыргызча', flag: '🇰🇬' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    en: { name: 'English', flag: '🇬🇧' },
    kz: { name: 'Қазақша', flag: '🇰🇿' },
    uz: { name: "O'zbekcha", flag: '🇺🇿' }
  }

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('preferred-language') || 'ky'
    setCurrentLang(saved)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (locale) => {
    setCurrentLang(locale)
    localStorage.setItem('preferred-language', locale)
    setIsOpen(false)
    
    // Emit custom event for language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: locale }))
  }

  const current = languages[currentLang]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{current.flag}</span>
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {current.name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          {Object.entries(languages).map(([locale, lang]) => (
            <button
              key={locale}
              onClick={() => changeLanguage(locale)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                currentLang === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLang === locale && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}