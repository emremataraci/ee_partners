import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import TreeMapChart from './components/TreeMapChart'
import PartnerListView from './components/PartnerListView'
import PartnerDetailPanel from './components/PartnerDetailPanel'
import './App.css'

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

function App() {
  const [partners, setPartners] = useState([])
  const [filteredPartners, setFilteredPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // View mode and details panel state
  const [viewMode, setViewMode] = useState('treemap') // 'treemap' | 'list'
  const [selectedPartner, setSelectedPartner] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    levels: ['Gold', 'Silver', 'Ready', 'Learning'],
    minReferences: 0,
    maxReferences: 100,
    selectedCities: []
  })

  // Visualization settings - default: references, options: references, district
  const [areaMetric, setAreaMetric] = useState('references')
  // areaMetric: 'references' | 'average_users'

  useEffect(() => {
    fetch('./odoo_partners.json')
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

        // Calculate max references and get unique cities (normalized)
        const maxRefs = Math.max(...enhancedPartners.map(p => p.references), 100)
        const uniqueCities = [...new Set(enhancedPartners.map(p => p.displayCity))].filter(Boolean).sort()

        setFilters(prev => ({
          ...prev,
          maxReferences: maxRefs,
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

    // References filter (dual slider)
    result = result.filter(p =>
      p.references >= filters.minReferences &&
      p.references <= filters.maxReferences
    )

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

  const toggleCity = (city) => {
    setFilters(prev => ({
      ...prev,
      selectedCities: prev.selectedCities.includes(city)
        ? prev.selectedCities.filter(c => c !== city)
        : [...prev.selectedCities, city]
    }))
  }

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Partner verileri yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        areaMetric={areaMetric}
      />

      <div className="main-content">
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar
              filters={filters}
              updateFilter={updateFilter}
              toggleLevel={toggleLevel}
              toggleCity={toggleCity}
              partners={partners}
              filteredCount={filteredPartners.length}
              totalCount={partners.length}
            />
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

            {viewMode === 'treemap' && (
              <div className="visualization-controls">
                <div className="control-group">
                  <span className="control-label">Boyut</span>
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
                <span className="chart-info-tag-key">Grafik Alanı</span>
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
          )}
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
                onPartnerClick={(partner) => setSelectedPartner(partner)}
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
      />
    </div>
  )
}

export default App
