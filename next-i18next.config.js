module.exports = {
  i18n: {
    defaultLocale: 'ky', // Kyrgyz as default
    locales: ['ky', 'ru', 'en', 'kz', 'uz'],
    localeDetection: false, // Don't auto-detect, use Kyrgyz by default
  },
  fallbackLng: {
    'ky': ['ru', 'en'],
    'kz': ['ru', 'en'],
    'uz': ['ru', 'en'],
    'default': ['ky']
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
