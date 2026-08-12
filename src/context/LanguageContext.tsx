import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Language } from '../i18n/translations'
import { translations } from '../i18n/translations'

const STORAGE_KEY = 'od-complaints-language'

type LanguageContextValue = {
  language: Language
  toggleLanguage: () => void
  t: (typeof translations)[Language]
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function readLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'de' ? 'de' : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore write failures (private mode etc.)
    }
  }, [language])

  function toggleLanguage() {
    setLanguage((current) => (current === 'en' ? 'de' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
