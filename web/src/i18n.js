import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationTR from './locales/tr/translation.json'

const DEFAULT_LANGUAGE = 'tr'
const SUPPORTED_LANGUAGES = ['tr', 'en', 'de']
const translationLoaders = {
  en: () => import('./locales/en/translation.json'),
  de: () => import('./locales/de/translation.json')
}

const normalizeLanguage = (language) => language?.split('-')[0]?.toLowerCase() || DEFAULT_LANGUAGE

const dynamicTranslationBackend = {
  type: 'backend',
  init: () => {},
  read: async (language, namespace, callback) => {
    const normalizedLanguage = normalizeLanguage(language)

    if (normalizedLanguage === DEFAULT_LANGUAGE) {
      callback(null, translationTR)
      return
    }

    const loadTranslation = translationLoaders[normalizedLanguage]

    if (!loadTranslation) {
      callback(null, translationTR)
      return
    }

    try {
      const module = await loadTranslation()
      callback(null, module.default)
    } catch (error) {
      callback(error, null)
    }
  }
}

let initPromise

export const initializeI18n = async () => {
  if (i18n.isInitialized) {
    return i18n
  }

  if (!initPromise) {
    initPromise = i18n
      .use(LanguageDetector)
      .use(dynamicTranslationBackend)
      .use(initReactI18next)
      .init({
        resources: {
          tr: { translation: translationTR }
        },
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        load: 'languageOnly',
        partialBundledLanguages: true,
        debug: false,
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        },
        detection: {
          order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage']
        }
      })
  }

  return initPromise
}

export { SUPPORTED_LANGUAGES }

export default i18n
