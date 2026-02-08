import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'
import { useState, useMemo } from 'react'

function Sidebar({ filters, updateFilter, toggleLevel, toggleCity, partners, filteredCount, totalCount }) {
    const [openSections, setOpenSections] = useState({
        level: true,
        references: true,
        city: false
    })

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const maxReferences = useMemo(() =>
        Math.max(...partners.map(p => p.references), 100)
        , [partners])

    const uniqueCities = useMemo(() =>
        [...new Set(partners.map(p => p.displayCity))].filter(Boolean).sort()
        , [partners])

    return (
        <motion.aside
            className="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
        >
            <div className="sidebar-header">
                <Filter size={16} />
                <span>Filtreler</span>
            </div>

            {/* Partner count widget */}
            <div className="partner-count-widget">
                <div className="partner-count-number">{filteredCount}</div>
                <div className="partner-count-label">/ {totalCount} partner gösteriliyor</div>
            </div>

            {/* Legend */}
            <div className="sidebar-legend">
                <div className="legend-title">Renk Açıklaması</div>
                <div className="legend-items-vertical">
                    <div className="legend-item-row">
                        <div className="legend-color gold"></div>
                        <span>Gold Partner</span>
                    </div>
                    <div className="legend-item-row">
                        <div className="legend-color silver"></div>
                        <span>Silver Partner</span>
                    </div>
                    <div className="legend-item-row">
                        <div className="legend-color ready"></div>
                        <span>Ready Partner</span>
                    </div>
                </div>
            </div>

            {/* Partner Seviyesi */}
            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('level')}>
                    <span>Partner Seviyesi</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.level ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.level && (
                    <div className="section-content">
                        {['Gold', 'Silver', 'Ready'].map(level => (
                            <label key={level} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.levels.includes(level)}
                                    onChange={() => toggleLevel(level)}
                                />
                                <span className={`level-badge ${level.toLowerCase()}`}>{level}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Referans Sayısı - Çift taraflı slider */}
            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('references')}>
                    <span>Referans Sayısı</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.references ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.references && (
                    <div className="section-content">
                        <div className="dual-slider">
                            <div className="slider-row">
                                <span className="slider-label">Min:</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxReferences}
                                    value={filters.minReferences}
                                    onChange={(e) => updateFilter('minReferences', parseInt(e.target.value))}
                                    className="range-slider"
                                />
                                <span className="slider-value">{filters.minReferences}</span>
                            </div>
                            <div className="slider-row">
                                <span className="slider-label">Max:</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxReferences}
                                    value={filters.maxReferences}
                                    onChange={(e) => updateFilter('maxReferences', parseInt(e.target.value))}
                                    className="range-slider"
                                />
                                <span className="slider-value">{filters.maxReferences}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Şehir */}
            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('city')}>
                    <span>Şehir</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.city ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.city && (
                    <div className="section-content city-list">
                        {uniqueCities.map(city => (
                            <label key={city} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedCities.includes(city)}
                                    onChange={() => toggleCity(city)}
                                />
                                <span>{city}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="sidebar-footer">
                <p className="disclaimer">
                    Veriler Odoo Partner Directory'den alınmıştır.
                </p>
            </div>
        </motion.aside>
    )
}

export default Sidebar
