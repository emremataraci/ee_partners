import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import TreeMapChart from '../components/TreeMapChart'
import PartnerListView from '../components/PartnerListView'
import PartnerDetailPanel from '../components/PartnerDetailPanel'
import CompareModal from '../components/CompareModal'
import Skeleton from '../components/Skeleton'
import '../components/CompareModal.css'

export const REFERENCE_RANGES = [
  { id: '0-25', label: '0 - 25 Referans', min: 0, max: 25 },
  { id: '26-50', label: '26 - 50 Referans', min: 26, max: 50 },
  { id: '50+', label: '50+ Referans', min: 51, max: Infinity }
]

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
  const [partners, setPartners] = useState([])
  const [filteredPartners, setFilteredPartners] = useState([])
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
        alert('En fazla 3 partner karşılaştırabilirsiniz.')
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
    selectedCities: []
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
          return {
            ...p,
            average_users: parseInt(p.average_project_size?.match(/\d+/)?.[0] || '0'),
            large_users: parseInt(p.large_project_size?.match(/\d+/)?.[0] || '0'),
            references: parseInt(p.references_count || '0'),
            experts: parseInt(p.certified_experts_count || '0'),
            displayCity: normalizeCity(rawCity),
            districtValue: parseInt(p.district) || 0
          }
        })
        setPartners(enhancedPartners)
        setFilteredPartners(enhancedPartners)
        setLoading(false)

        // Get unique cities (normalized)
        const uniqueCities = [...new Set(enhancedPartners.map(p => p.displayCity))].filter(Boolean).sort()

        setFilters(prev => ({
          ...prev,
          selectedCities: uniqueCities
        }))
      })
      .catch(err => {
        console.error('Error loading partners:', err)
        setLoading(false)
      })
  }, [])

  // Apply filters
  useEffect(() => {
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

    setFilteredPartners(result)
  }, [partners, searchQuery, filters])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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
              <motion.div 
                className="sidebar-overlay" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)} 
              />
              <Sidebar
                filters={filters}
                updateFilter={updateFilter}
                toggleLevel={toggleLevel}
                toggleRefRange={toggleRefRange}
                toggleCity={toggleCity}
                partners={partners}
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
                  Harita
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
                  Liste
                </button>
              </div>
            </div>

            <div className="visualization-controls">
              <div className="control-group">
                <span className="control-label">{viewMode === 'treemap' ? 'Boyut' : 'Sıralama'}</span>
                <div className="segmented-control">
                  <button
                    className={`segment-btn ${areaMetric === 'references' ? 'active' : ''}`}
                    onClick={() => setAreaMetric('references')}
                  >
                    Referans
                  </button>
                  <button
                    className={`segment-btn ${areaMetric === 'average_users' ? 'active' : ''}`}
                    onClick={() => setAreaMetric('average_users')}
                  >
                    Ort. Kullanıcı
                  </button>
                </div>
              </div>

              {/* Info tags — read only */}
              <div className="chart-info-tags">
                <div className="chart-info-tag">
                  <span className="chart-info-tag-key">{viewMode === 'treemap' ? 'Grafik Alanı' : 'Sıralama'}</span>
                  <span className="chart-info-tag-sep">·</span>
                  <span className="chart-info-tag-val">
                    {areaMetric === 'references' ? 'Referans Sayısı' : 'Ort. Kullanıcı Sayısı'}
                  </span>
                </div>
                <div className="chart-info-tag">
                  <span className="chart-info-tag-key">Renk</span>
                  <span className="chart-info-tag-sep">·</span>
                  <span className="chart-info-tag-val">Partner Seviyesi</span>
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
                Bu veriler Odoo Partner Directory'deki kamuya açık bilgilerden derlenmiştir.
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
