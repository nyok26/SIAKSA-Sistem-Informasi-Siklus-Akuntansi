import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.json';
import id from './id.json';

type Translations = Record<string, any>;

interface LanguageContextValue {
  locale: 'en' | 'id';
  setLocale: (l: 'en' | 'id') => void;
  t: (key: string) => string;
}

const translations: Record<'en' | 'id', Translations> = {
  en,
  id,
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function deepGet(obj: any, path: string) {
  return path.split('.').reduce((acc: any, p) => (acc && acc[p] !== undefined ? acc[p] : undefined), obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<'en' | 'id'>(() => {
    try {
      const stored = localStorage.getItem('locale');
      if (stored === 'id' || stored === 'en') return stored;
      const nav = navigator.language || navigator.languages?.[0] || 'en';
      return nav.startsWith('id') ? 'id' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('locale', locale); } catch {}
  }, [locale]);

  const setLocale = (l: 'en' | 'id') => setLocaleState(l);

  const t = (key: string) => {
    const val = deepGet(translations[locale], key);
    if (typeof val === 'string') return val;
    // fallback to english
    const fallback = deepGet(translations['en'], key);
    return typeof fallback === 'string' ? fallback : key;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}

export default LanguageProvider;
