import { DEFAULT_REGION, normalizeRegionCode } from '../constants/regions'

const datasetCache = new Map()
const REGION_DATA_BASE = '/ee_partners/data/regions'

export const getRegionDatasetUrl = (regionCode) => (
  `${REGION_DATA_BASE}/${normalizeRegionCode(regionCode)}.json`
)

export const loadRegionDataset = async (regionCode) => {
  const normalizedRegion = normalizeRegionCode(regionCode)

  if (datasetCache.has(normalizedRegion)) {
    return datasetCache.get(normalizedRegion)
  }

  const request = fetch(getRegionDatasetUrl(normalizedRegion))
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load region dataset: ${normalizedRegion}`)
      }

      return response.json()
    })
    .catch(async (error) => {
      if (normalizedRegion !== DEFAULT_REGION) {
        datasetCache.delete(normalizedRegion)
        return loadRegionDataset(DEFAULT_REGION)
      }

      throw error
    })

  datasetCache.set(normalizedRegion, request)

  const resolved = await request
  datasetCache.set(normalizedRegion, resolved)
  return resolved
}
