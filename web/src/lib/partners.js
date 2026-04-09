import { getPartnerLanguageCodes } from '../constants/partnerLanguages'
import { DEFAULT_REGION, getRegionDisplayName, normalizeRegionCode } from '../constants/regions'
import { extractPartnerId } from '../utils'

export const DEFAULT_RANGE = { min: 0, max: 0 }

export const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const match = String(value).match(/\d+(?:[.,]\d+)?/)
  if (!match) return null

  return Number(match[0].replace(',', '.'))
}

export const buildNumericBounds = (values) => {
  const validValues = values.filter((value) => Number.isFinite(value))

  if (!validValues.length) {
    return { ...DEFAULT_RANGE }
  }

  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues)
  }
}

const normalizeText = (value) => value?.trim?.().toLocaleLowerCase('tr-TR') || ''

const areSameLocation = (left, right) => {
  if (!left || !right) return false
  return normalizeText(left) === normalizeText(right)
}

export const normalizeCity = (city) => {
  if (!city) return null

  const normalized = city.trim().split('/')[0].split(',')[0].trim()
  if (!normalized) return null

  if (normalizeText(normalized) === 'istanbul') {
    return 'İstanbul'
  }

  return normalized
}

export const enhancePartner = (partner, regionCode = DEFAULT_REGION, locale = 'tr') => {
  const normalizedRegion = normalizeRegionCode(regionCode)
  const industries = (partner.industries_breakdown ?? [])
    .map((item) => item.industry?.trim())
    .filter(Boolean)
  const averageUsers = parseNumericValue(partner.average_project_size) ?? 0
  const largeUsers = parseNumericValue(partner.large_project_size) ?? 0
  const references = parseNumericValue(partner.references_count) ?? 0
  const experts = parseNumericValue(partner.certified_experts_count) ?? 0
  const rating = parseNumericValue(partner.rating_percentage)
  const rawCity = areSameLocation(partner.city, partner.country) ? '' : partner.city
  const displayCity = normalizeCity(rawCity)
  const displayCountry = getRegionDisplayName(normalizedRegion, locale)

  return {
    ...partner,
    region_code: normalizedRegion,
    partner_id: extractPartnerId(partner.profile_url),
    average_users: averageUsers,
    large_users: largeUsers,
    references,
    experts,
    rating,
    industries,
    spoken_languages: getPartnerLanguageCodes(partner),
    displayCity,
    displayCountry,
    displayLocation: displayCity || displayCountry,
    districtValue: parseNumericValue(partner.district) ?? 0
  }
}
