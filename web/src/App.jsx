import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import TreeMapChart from './components/TreeMapChart'
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

  // Filters
  const [filters, setFilters] = useState({
    levels: ['Gold', 'Silver', 'Ready'],
    minReferences: 0,
    maxReferences: 100,
    selectedCities: []
  })

  // Visualization settings - default: references, options: references, district
  const [areaMetric, setAreaMetric] = useState('references')

  useEffect(() => {
    fetch('/odoo_partners.json')
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

        <main className="treemap-container">
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
                  className={`segment-btn ${areaMetric === 'district' ? 'active' : ''}`}
                  onClick={() => setAreaMetric('district')}
                >
                  Değerlendirme
                </button>
              </div>
            </div>
          </div>

          <TreeMapChart
            partners={filteredPartners}
            areaMetric={areaMetric}
          />

          <footer className="map-footer">
            <p>
              Bu veriler Odoo Partner Directory'deki kamuya açık bilgilerden derlenmiştir.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
