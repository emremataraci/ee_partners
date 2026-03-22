import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'
import { useState, useMemo } from 'react'
import { REFERENCE_RANGES } from '../pages/Home'
import { useTranslation } from 'react-i18next'

function Sidebar({ filters, updateFilter, toggleLevel, toggleRefRange, toggleCity, partners, filteredCount, totalCount }) {
    const { t } = useTranslation()
    const [openSections, setOpenSections] = useState({
        level: true,
        references: true,
        city: false
    })

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

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
                <span>{t('sidebar.filters')}</span>
            </div>

            {/* Partner count widget */}
            <div className="partner-count-widget">
                <div className="partner-count-number">{filteredCount}</div>
                <div className="partner-count-label">{t('sidebar.partnerCount', { totalCount })}</div>
            </div>

            {/* Partner Seviyesi */}
            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('level')}>
                    <span>{t('sidebar.partnerLevel')}</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.level ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.level && (
                    <div className="section-content">
                        {['Gold', 'Silver', 'Ready', 'Learning'].map(level => (
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
                    <span>{t('sidebar.references')}</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.references ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.references && (
                    <div className="section-content">
                        <div className="checkbox-group">
                            {REFERENCE_RANGES.map(range => (
                                <label key={range.id} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedRefRanges?.includes(range.id)}
                                        onChange={() => toggleRefRange(range.id)}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="label-text">{t(`home.ranges.${range.id}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Şehir */}
            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('city')}>
                    <span>{t('sidebar.city')}</span>
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
                    {t('sidebar.disclaimer')}
                </p>
            </div>
        </motion.aside>
    )
}

export default Sidebar
