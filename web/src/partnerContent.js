import { generateSlug } from './utils'

const localeContentCache = new Map()

export const normalizeLanguage = (language) => language?.split('-')[0]?.toLowerCase() || 'tr'

export const loadPartnerLocaleContent = async (language) => {
  const normalizedLanguage = normalizeLanguage(language)

  if (localeContentCache.has(normalizedLanguage)) {
    return localeContentCache.get(normalizedLanguage)
  }

  const request = fetch(`/ee_partners/locales/partners/${normalizedLanguage}.json`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load partner locale content for ${normalizedLanguage}`)
      }

      const payload = await response.json()
      return payload?.partners || {}
    })
    .catch((error) => {
      console.error(error)
      return {}
    })

  localeContentCache.set(normalizedLanguage, request)

  const resolved = await request
  localeContentCache.set(normalizedLanguage, resolved)
  return resolved
}

export const getPartnerLocalizedField = (partner, localizedContent, field) => {
  const slug = typeof partner === 'string' ? partner : generateSlug(partner?.name)
  return localizedContent?.[slug]?.[field]
}
