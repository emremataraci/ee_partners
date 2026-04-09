export const DEFAULT_PARTNER_LANGUAGE_CODES = ['tr', 'en']

const PARTNER_LANGUAGE_META = {
  tr: { flag: '🇹🇷' },
  en: { flag: '🇬🇧' },
  de: { flag: '🇩🇪' }
}

export const getPartnerLanguageCodes = (partnerOrLanguages) => {
  const source = Array.isArray(partnerOrLanguages)
    ? partnerOrLanguages
    : partnerOrLanguages?.spoken_languages

  const languages = source?.length ? source : DEFAULT_PARTNER_LANGUAGE_CODES
  return [...new Set(languages.filter(code => PARTNER_LANGUAGE_META[code]))]
}

export const getPartnerLanguageMeta = (code) => PARTNER_LANGUAGE_META[code] || null

export const getPartnerLanguageLabel = (code, t) => (
  t(`partnerLanguages.${code}`, { defaultValue: code.toUpperCase() })
)
