// lib/translations.js - Simple translation system for Career Catch
// This replaces the complex next-i18next setup with a simple, working solution

const translations = {
  en: {
    nav: {
      home: 'Home',
      findJobs: 'Find Jobs',
      companies: 'Companies',
      salaries: 'Salaries',
      careerAdvice: 'Career Advice',
      postJob: 'Post a Job',
      forEmployers: 'For Employers',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      dashboard: 'Dashboard',
      profile: 'Profile',
      applications: 'Applications',
      savedJobs: 'Saved Jobs',
      settings: 'Settings',
      signOut: 'Sign Out',
      postedJobs: 'Posted Jobs'
    },
    hero: {
      title: 'Find Your Dream Job in Central Asia',
      subtitle: 'Connect with top employers across Kyrgyzstan, Kazakhstan, Uzbekistan & Tajikistan',
      searchPlaceholder: 'Job title, keywords, or company',
      locationPlaceholder: 'City or Country',
      searchButton: 'Search Jobs'
    },
    stats: {
      activeJobs: 'Active Jobs',
      companies: 'Companies',
      jobSeekers: 'Job Seekers'
    },
    categories: {
      title: 'Browse by Category',
      viewAll: 'View All Categories'
    },
    featured: {
      title: 'Featured Jobs',
      viewAll: 'View All Jobs',
      apply: 'Apply Now',
      save: 'Save'
    },
    footer: {
      tagline: 'Hooking You Up with the Right Opportunity',
      quickLinks: 'Quick Links',
      aboutUs: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      forJobSeekers: 'For Job Seekers',
      browseJobs: 'Browse Jobs',
      careerAdvice: 'Career Advice',
      resumeBuilder: 'Resume Builder',
      forEmployers: 'For Employers',
      postJob: 'Post a Job',
      searchCandidates: 'Search Candidates',
      pricing: 'Pricing',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      newsletterText: 'Get the latest jobs delivered to your inbox',
      subscribe: 'Subscribe',
      emailPlaceholder: 'Enter your email',
      rights: 'All rights reserved',
      madeWith: 'Made with ❤️ in Central Asia'
    }
  },
  ru: {
    nav: {
      home: 'Главная',
      findJobs: 'Найти работу',
      companies: 'Компании',
      salaries: 'Зарплаты',
      careerAdvice: 'Карьерные советы',
      postJob: 'Разместить вакансию',
      forEmployers: 'Работодателям',
      signIn: 'Войти',
      signUp: 'Регистрация',
      dashboard: 'Панель управления',
      profile: 'Профиль',
      applications: 'Заявки',
      savedJobs: 'Сохраненные вакансии',
      settings: 'Настройки',
      signOut: 'Выйти',
      postedJobs: 'Размещенные вакансии'
    },
    hero: {
      title: 'Найдите работу мечты в Центральной Азии',
      subtitle: 'Связь с ведущими работодателями в Кыргызстане, Казахстане, Узбекистане и Таджикистане',
      searchPlaceholder: 'Должность, ключевые слова или компания',
      locationPlaceholder: 'Город или Страна',
      searchButton: 'Найти работу'
    },
    stats: {
      activeJobs: 'Активные вакансии',
      companies: 'Компании',
      jobSeekers: 'Соискатели'
    },
    categories: {
      title: 'Поиск по категориям',
      viewAll: 'Все категории'
    },
    featured: {
      title: 'Рекомендуемые вакансии',
      viewAll: 'Все вакансии',
      apply: 'Откликнуться',
      save: 'Сохранить'
    },
    footer: {
      tagline: 'Подключаем вас к правильным возможностям',
      quickLinks: 'Быстрые ссылки',
      aboutUs: 'О нас',
      contact: 'Контакты',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      forJobSeekers: 'Соискателям',
      browseJobs: 'Просмотр вакансий',
      careerAdvice: 'Карьерные советы',
      resumeBuilder: 'Конструктор резюме',
      forEmployers: 'Работодателям',
      postJob: 'Разместить вакансию',
      searchCandidates: 'Поиск кандидатов',
      pricing: 'Цены',
      followUs: 'Подписывайтесь',
      newsletter: 'Рассылка',
      newsletterText: 'Получайте новые вакансии на почту',
      subscribe: 'Подписаться',
      emailPlaceholder: 'Введите email',
      rights: 'Все права защищены',
      madeWith: 'Сделано с ❤️ в Центральной Азии'
    }
  }
};

// Simple hook for using translations
export function useTranslations() {
  // Check if we're on client side
  if (typeof window === 'undefined') {
    // Server-side: return default language
    return (key) => {
      const keys = key.split('.');
      let value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }

  // Client-side: use stored language preference
  const lang = localStorage.getItem('preferred-language') || 'en';
  
  return (key) => {
    const keys = key.split('.');
    let value = translations[lang] || translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
}

// Get current language
export function getCurrentLanguage() {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('preferred-language') || 'en';
}

// Set language
export function setLanguage(lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preferred-language', lang);
  // Trigger a custom event to update components
  window.dispatchEvent(new Event('languagechange'));
}

// Get available languages
export function getLanguages() {
  return [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
}

export default translations;