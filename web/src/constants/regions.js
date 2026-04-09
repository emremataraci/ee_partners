export const DEFAULT_REGION = 'tr'
export const REGION_STORAGE_KEY = 'ee-partner-region'

export const REGION_OPTIONS = [
  { code: 'tr', countryCode: 'TR', fallbackName: 'Türkiye' },
  { code: 'ad', countryCode: 'AD', fallbackName: 'Andorra' },
  { code: 'al', countryCode: 'AL', fallbackName: 'Albania' },
  { code: 'at', countryCode: 'AT', fallbackName: 'Austria' },
  { code: 'ba', countryCode: 'BA', fallbackName: 'Bosnia and Herzegovina' },
  { code: 'be', countryCode: 'BE', fallbackName: 'Belgium' },
  { code: 'bg', countryCode: 'BG', fallbackName: 'Bulgaria' },
  { code: 'ch', countryCode: 'CH', fallbackName: 'Switzerland' },
  { code: 'cy', countryCode: 'CY', fallbackName: 'Cyprus' },
  { code: 'cz', countryCode: 'CZ', fallbackName: 'Czech Republic' },
  { code: 'de', countryCode: 'DE', fallbackName: 'Germany' },
  { code: 'dk', countryCode: 'DK', fallbackName: 'Denmark' },
  { code: 'ee', countryCode: 'EE', fallbackName: 'Estonia' },
  { code: 'es', countryCode: 'ES', fallbackName: 'Spain' },
  { code: 'fi', countryCode: 'FI', fallbackName: 'Finland' },
  { code: 'fr', countryCode: 'FR', fallbackName: 'France' },
  { code: 'gb', countryCode: 'GB', fallbackName: 'United Kingdom' },
  { code: 'gr', countryCode: 'GR', fallbackName: 'Greece' },
  { code: 'hr', countryCode: 'HR', fallbackName: 'Croatia' },
  { code: 'hu', countryCode: 'HU', fallbackName: 'Hungary' },
  { code: 'ie', countryCode: 'IE', fallbackName: 'Ireland' },
  { code: 'is', countryCode: 'IS', fallbackName: 'Iceland' },
  { code: 'it', countryCode: 'IT', fallbackName: 'Italy' },
  { code: 'lt', countryCode: 'LT', fallbackName: 'Lithuania' },
  { code: 'lu', countryCode: 'LU', fallbackName: 'Luxembourg' },
  { code: 'lv', countryCode: 'LV', fallbackName: 'Latvia' },
  { code: 'mc', countryCode: 'MC', fallbackName: 'Monaco' },
  { code: 'me', countryCode: 'ME', fallbackName: 'Montenegro' },
  { code: 'mk', countryCode: 'MK', fallbackName: 'North Macedonia' },
  { code: 'mt', countryCode: 'MT', fallbackName: 'Malta' },
  { code: 'nl', countryCode: 'NL', fallbackName: 'Netherlands' },
  { code: 'no', countryCode: 'NO', fallbackName: 'Norway' },
  { code: 'pl', countryCode: 'PL', fallbackName: 'Poland' },
  { code: 'pt', countryCode: 'PT', fallbackName: 'Portugal' },
  { code: 'ro', countryCode: 'RO', fallbackName: 'Romania' },
  { code: 'rs', countryCode: 'RS', fallbackName: 'Serbia' },
  { code: 'se', countryCode: 'SE', fallbackName: 'Sweden' },
  { code: 'si', countryCode: 'SI', fallbackName: 'Slovenia' },
  { code: 'sk', countryCode: 'SK', fallbackName: 'Slovakia' },
  { code: 'ua', countryCode: 'UA', fallbackName: 'Ukraine' },
  { code: 'xk', countryCode: 'XK', fallbackName: 'Kosovo' }
]

const REGION_LOOKUP = new Map(REGION_OPTIONS.map((option) => [option.code, option]))

const TIMEZONE_REGION_MAP = {
  'Europe/Amsterdam': 'nl',
  'Europe/Andorra': 'ad',
  'Europe/Athens': 'gr',
  'Europe/Belgrade': 'rs',
  'Europe/Berlin': 'de',
  'Europe/Bratislava': 'sk',
  'Europe/Brussels': 'be',
  'Europe/Bucharest': 'ro',
  'Europe/Budapest': 'hu',
  'Europe/Copenhagen': 'dk',
  'Europe/Dublin': 'ie',
  'Europe/Helsinki': 'fi',
  'Europe/Istanbul': 'tr',
  'Europe/Kyiv': 'ua',
  'Europe/Lisbon': 'pt',
  'Europe/Ljubljana': 'si',
  'Europe/London': 'gb',
  'Europe/Luxembourg': 'lu',
  'Europe/Madrid': 'es',
  'Europe/Monaco': 'mc',
  'Europe/Nicosia': 'cy',
  'Europe/Oslo': 'no',
  'Europe/Paris': 'fr',
  'Europe/Podgorica': 'me',
  'Europe/Prague': 'cz',
  'Europe/Reykjavik': 'is',
  'Europe/Riga': 'lv',
  'Europe/Rome': 'it',
  'Europe/Sarajevo': 'ba',
  'Europe/Skopje': 'mk',
  'Europe/Sofia': 'bg',
  'Europe/Stockholm': 'se',
  'Europe/Tallinn': 'ee',
  'Europe/Tirane': 'al',
  'Europe/Vienna': 'at',
  'Europe/Vilnius': 'lt',
  'Europe/Warsaw': 'pl',
  'Europe/Zagreb': 'hr',
  'Europe/Zurich': 'ch'
}

const normalizeBrowserLocale = (value) => value?.trim?.() || ''

const localeToRegionCode = (locale) => {
  const normalizedLocale = normalizeBrowserLocale(locale)
  if (!normalizedLocale) return null

  try {
    const localeRegion = new Intl.Locale(normalizedLocale).region
    if (localeRegion) {
      return localeRegion.toLowerCase()
    }
  } catch {
    // Intl.Locale is not available everywhere. Fall back to string parsing below.
  }

  const localeParts = normalizedLocale.split(/[-_]/)
  const candidate = localeParts[localeParts.length - 1]
  return candidate?.length === 2 ? candidate.toLowerCase() : null
}

const countryCodeToFlag = (countryCode) => (
  String.fromCodePoint(...countryCode.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)))
)

export const normalizeRegionCode = (value) => value?.trim?.().toLowerCase() || DEFAULT_REGION

export const isSupportedRegion = (value) => REGION_LOOKUP.has(normalizeRegionCode(value))

export const getRegionByCode = (value) => REGION_LOOKUP.get(normalizeRegionCode(value)) || REGION_LOOKUP.get(DEFAULT_REGION)

export const getRegionFlag = (value) => countryCodeToFlag(getRegionByCode(value).countryCode)

export const getRegionDisplayName = (value, locale = 'en') => {
  const region = getRegionByCode(value)

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return displayNames.of(region.countryCode) || region.fallbackName
  } catch {
    return region.fallbackName
  }
}

export const detectPreferredRegion = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_REGION
  }

  const storedRegion = window.localStorage.getItem(REGION_STORAGE_KEY)
  if (isSupportedRegion(storedRegion)) {
    return normalizeRegionCode(storedRegion)
  }

  const browserLanguages = [
    window.navigator.language,
    ...(window.navigator.languages || [])
  ]

  for (const locale of browserLanguages) {
    const regionCode = localeToRegionCode(locale)
    if (isSupportedRegion(regionCode)) {
      return normalizeRegionCode(regionCode)
    }
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (TIMEZONE_REGION_MAP[timeZone]) {
    return TIMEZONE_REGION_MAP[timeZone]
  }

  return DEFAULT_REGION
}
