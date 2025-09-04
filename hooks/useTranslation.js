// hooks/useTranslation.js - Translation hook with hydration fix
import { useState, useEffect } from 'react'
import translations from '../lib/translations'

export default function useTranslation() {
  const [lang, setLang] = useState('ky') // Default to Kyrgyz
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedLang = localStorage.getItem('preferred-language') || 'ky'
    setLang(savedLang)

    const handleLangChange = (e) => {
      setLang(e.detail)
    }

    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  // Return Kyrgyz during SSR and initial hydration
  if (!isClient) {
    return translations.ky
  }

  return translations[lang] || translations.ky
}