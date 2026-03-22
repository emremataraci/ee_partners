import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import TreeMapChart from '../components/TreeMapChart'
import PartnerListView from '../components/PartnerListView'
import PartnerDetailPanel from '../components/PartnerDetailPanel'
import CompareModal from '../components/CompareModal'
import Skeleton from '../components/Skeleton'
import { REFERENCE_RANGES } from '../constants/filters'
import '../components/CompareModal.css'

const DEFAULT_RANGE = { min: 0, max: 0 }

const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const match = String(value).match(/\d+(?:[.,]\d+)?/)
  if (!match) return null

  return Number(match[0].replace(',', '.'))
}

const buildNumericBounds = (values) => {
  const validValues = values.filter(value => Number.isFinite(value))

  if (!validValues.length) {
    return { ...DEFAULT_RANGE }
  }

  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues)
  }
}

const sortLabels = (values) => (
  [...values].sort((a, b) => a.localeCompare(b, 'tr'))
)

const isDefaultRange = (range, bounds) => (
  range.min === bounds.min && range.max === bounds.max
)

const MotionDiv = motion.div

// Normalize city names
const normalizeCity = (city) => {
  if (!city) return null
  const normalized = city.trim()
  // Fix İstanbul variations
  if (normalized.toLowerCase() === 'istanbul' || normalized === 'İstanbul') {
    return 'İstanbul'
  }
  return normalized
}

function Home() {
  const { t } = useTranslation()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)

  // Add event listener for window resize to handle sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // View mode and details panel state
  const [viewMode, setViewMode] = useState('treemap') // 'treemap' | 'list'
  const [selectedPartner, setSelectedPartner] = useState(null)

  // Compare State
  const [comparedPartners, setComparedPartners] = useState([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  const toggleCompare = (partner) => {
    setComparedPartners(prev => {
      if (prev.find(p => p.name === partner.name)) {
        return prev.filter(p => p.name !== partner.name)
      }
      if (prev.length >= 3) {
        alert(t('home.maxCompareAlert'))
        return prev
      }
      return [...prev, partner]
    })
  }

  const toggleCompareByName = (name) => {
    setComparedPartners(prev => prev.filter(p => p.name !== name))
  }

  const [filters, setFilters] = useState({
    levels: ['Gold', 'Silver', 'Ready', 'Learning'],
    selectedRefRanges: [],
    selectedCities: [],
    selectedIndustries: [],
    ratingRange: { ...DEFAULT_RANGE },
    certificateRange: { ...DEFAULT_RANGE }
  })
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    industries: [],
    ratingBounds: { ...DEFAULT_RANGE },
    certificateBounds: { ...DEFAULT_RANGE }
  })

  // Visualization settings - default: references, options: references, district
  const [areaMetric, setAreaMetric] = useState('references')
  // areaMetric: 'references' | 'average_users'

  useEffect(() => {
    fetch('/ee_partners/odoo_partners.json')
      .then(res => res.json())
      .then(data => {
        // Parse and enhance partner data
        const enhancedPartners = data.partners.map(p => {
          const rawCity = p.city === 'Türkiye' ? p.country : p.city
          const industries = (p.industries_breakdown ?? [])
            .map(item => item.industry?.trim())
            .filter(Boolean)
          const averageUsers = parseNumericValue(p.average_project_size) ?? 0
          const largeUsers = parseNumericValue(p.large_project_size) ?? 0
          const references = parseNumericValue(p.references_count) ?? 0
          const experts = parseNumericValue(p.certified_experts_count) ?? 0
          const rating = parseNumericValue(p.rating_percentage)

          return {
            ...p,
            average_users: averageUsers,
            large_users: largeUsers,
            references,
            experts,
            rating,
            industries,
            displayCity: normalizeCity(rawCity),
            districtValue: parseNumericValue(p.district) ?? 0
          }
        })

        const uniqueCities = sortLabels(
          [...new Set(enhancedPartners.map(p => p.displayCity))].filter(Boolean)
        )
        const uniqueIndustries = sortLabels(
          [...new Set(enhancedPartners.flatMap(p => p.industries))].filter(Boolean)
        )
        const ratingBounds = buildNumericBounds(enhancedPartners.map(p => p.rating))
        const certificateBounds = buildNumericBounds(enhancedPartners.map(p => p.experts))

        setPartners(enhancedPartners)
        setFilterOptions({
          cities: uniqueCities,
          industries: uniqueIndustries,
          ratingBounds,
          certificateBounds
        })

        setFilters(prev => ({
          ...prev,
          selectedCities: uniqueCities,
          selectedIndustries: uniqueIndustries,
          ratingRange: { ...ratingBounds },
          certificateRange: { ...certificateBounds }
        }))

        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading partners:', err)
        setLoading(false)
      })
  }, [])

  const filteredPartners = useMemo(() => {
    let result = partners

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.displayCity?.toLowerCase().includes(query)
      )
    }

    // Level filter
    if (filters.levels.length > 0) {
      result = result.filter(p => filters.levels.includes(p.level))
    }

    // References filter (ranges)
    if (filters.selectedRefRanges && filters.selectedRefRanges.length > 0) {
      result = result.filter(p => {
        return filters.selectedRefRanges.some(rangeId => {
          const rangeInfo = REFERENCE_RANGES.find(r => r.id === rangeId)
          if (!rangeInfo) return false
          return p.references >= rangeInfo.min && p.references <= rangeInfo.max
        })
      })
    }

    // City filter - always apply (if no cities selected, show nothing)
    result = result.filter(p => filters.selectedCities.includes(p.displayCity))

    const industryFilterActive = filters.selectedIndustries.length !== filterOptions.industries.length
    if (industryFilterActive) {
      result = result.filter(p =>
        p.industries.some(industry => filters.selectedIndustries.includes(industry))
      )
    }

    const ratingFilterActive = !isDefaultRange(filters.ratingRange, filterOptions.ratingBounds)
    if (ratingFilterActive) {
      result = result.filter(p =>
        p.rating !== null &&
        p.rating >= filters.ratingRange.min &&
        p.rating <= filters.ratingRange.max
      )
    }

    const certificateFilterActive = !isDefaultRange(filters.certificateRange, filterOptions.certificateBounds)
    if (certificateFilterActive) {
      result = result.filter(p =>
        p.experts >= filters.certificateRange.min &&
        p.experts <= filters.certificateRange.max
      )
    }

    return result
  }, [partners, searchQuery, filters, filterOptions])

  const toggleLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }))
  }

  const toggleRefRange = (rangeId) => {
    setFilters(prev => ({
      ...prev,
      selectedRefRanges: prev.selectedRefRanges.includes(rangeId)
        ? prev.selectedRefRanges.filter(r => r !== rangeId)
        : [...prev.selectedRefRanges, rangeId]
    }))
  }

  const toggleCity = (city) => {
    setFilters(prev => ({
      ...prev,
      selectedCities: prev.selectedCities.includes(city)
        ? prev.selectedCities.filter(c => c !== city)
        : [...prev.selectedCities, city]
    }))
  }

  const toggleIndustry = (industry) => {
    setFilters(prev => ({
      ...prev,
      selectedIndustries: prev.selectedIndustries.includes(industry)
        ? prev.selectedIndustries.filter(item => item !== industry)
        : [...prev.selectedIndustries, industry]
    }))
  }

  const updateRangeFilter = (key, boundary, rawValue, bounds) => {
    const nextValue = Math.min(bounds.max, Math.max(bounds.min, Number(rawValue)))

    setFilters(prev => {
      const currentRange = prev[key]
      const nextRange = { ...currentRange, [boundary]: nextValue }

      if (boundary === 'min' && nextValue > currentRange.max) {
        nextRange.max = nextValue
      }

      if (boundary === 'max' && nextValue < currentRange.min) {
        nextRange.min = nextValue
      }

      return {
        ...prev,
        [key]: nextRange
      }
    })
  }

  if (loading) {
    return <Skeleton />
  }

  return (
    <div className="app">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        areaMetric={areaMetric}
        comparedPartners={comparedPartners}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <div className="main-content">
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <MotionDiv
                className="sidebar-overlay" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)} 
              />
              <Sidebar
                filters={filters}
                toggleLevel={toggleLevel}
                toggleRefRange={toggleRefRange}
                toggleCity={toggleCity}
                toggleIndustry={toggleIndustry}
                updateRangeFilter={updateRangeFilter}
                cityOptions={filterOptions.cities}
                industryOptions={filterOptions.industries}
                ratingBounds={filterOptions.ratingBounds}
                certificateBounds={filterOptions.certificateBounds}
                filteredCount={filteredPartners.length}
                totalCount={partners.length}
              />
            </>
          )}
        </AnimatePresence>

        <main className={`main-content-area ${viewMode === 'list' ? 'list-mode-active' : ''}`}>
          <div className="visualization-controls-bar">
            <div className="view-mode-toggle">
              <div className="segmented-control">
                <button
                  className={`segment-btn ${viewMode === 'treemap' ? 'active' : ''}`}
                  onClick={() => setViewMode('treemap')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="3" x2="12" y2="21" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                  {t('home.map')}
                </button>
                <button
                  className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  {t('home.list')}
                </button>
              </div>
            </div>

            <div className="visualization-controls">
              <div className="control-group">
                <span className="control-label">{viewMode === 'treemap' ? t('home.size') : t('home.sort')}</span>
                <div className="segmented-control">
                  <button
                    className={`segment-btn ${areaMetric === 'references' ? 'active' : ''}`}
                    onClick={() => setAreaMetric('references')}
                  >
                    {t('home.reference')}
                  </button>
                  <button
                    className={`segment-btn ${areaMetric === 'average_users' ? 'active' : ''}`}
                    onClick={() => setAreaMetric('average_users')}
                  >
                    {t('home.avgUsers')}
                  </button>
                </div>
              </div>

              {/* Info tags — read only */}
              <div className="chart-info-tags">
                <div className="chart-info-tag">
                  <span className="chart-info-tag-key">{viewMode === 'treemap' ? t('home.chartArea') : t('home.sort')}</span>
                  <span className="chart-info-tag-sep">·</span>
                  <span className="chart-info-tag-val">
                    {areaMetric === 'references' ? t('home.numReferences') : t('home.numAvgUsers')}
                  </span>
                </div>
                <div className="chart-info-tag">
                  <span className="chart-info-tag-key">{t('home.color')}</span>
                  <span className="chart-info-tag-sep">·</span>
                  <span className="chart-info-tag-val">{t('home.partnerLevel')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="visualization-content">
            {viewMode === 'treemap' ? (
              <TreeMapChart
                partners={filteredPartners}
                areaMetric={areaMetric}
                onPartnerClick={(partner) => setSelectedPartner(partner)}
              />
            ) : (
              <PartnerListView
                partners={filteredPartners}
                areaMetric={areaMetric}
                onPartnerClick={(partner) => setSelectedPartner(partner)}
                comparedPartners={comparedPartners}
                onToggleCompare={toggleCompare}
              />
            )}
          </div>

          {viewMode === 'treemap' && (
            <footer className="map-footer">
              <p>
                {t('home.footerDesc')}
              </p>
            </footer>
          )}
        </main>
      </div>

      {/* Partner Detail Panel Slide-over */}
      <PartnerDetailPanel
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        comparedPartners={comparedPartners}
        onToggleCompare={toggleCompare}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        partners={comparedPartners}
        onRemove={toggleCompareByName}
      />
    </div>
  )
}

export default Home
