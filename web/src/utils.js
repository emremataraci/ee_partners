export const generateSlug = (name) => {
  if (!name) return ''
  
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'i': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  }

  let str = name
  for (let key in trMap) {
    str = str.replace(new RegExp(key, 'g'), trMap[key])
  }

  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export const extractPartnerId = (profileUrl) => {
  if (!profileUrl) return ''

  const match = profileUrl.match(/-(\d+)(?:\?|$)/) || profileUrl.match(/\/(\d+)(?:\/|$)/)
  return match?.[1] || ''
}

export const buildPartnerProfileUrl = (partner) => {
  const slug = generateSlug(partner?.name)
  const searchParams = new URLSearchParams()
  const regionCode = partner?.region_code || partner?.region
  const partnerId = partner?.partner_id || extractPartnerId(partner?.profile_url)

  if (regionCode) {
    searchParams.set('region', regionCode)
  }

  if (partnerId) {
    searchParams.set('id', partnerId)
  }

  const query = searchParams.toString()
  return `/partners/${slug}${query ? `?${query}` : ''}`
}
