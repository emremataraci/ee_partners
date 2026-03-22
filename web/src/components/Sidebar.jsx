import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { REFERENCE_RANGES } from '../constants/filters'
import { useTranslation } from 'react-i18next'

const MotionAside = motion.aside

function RangeFilterSection({
    label,
    sectionKey,
    isOpen,
    onToggle,
    range,
    bounds,
    onChange,
    formatValue,
    minLabel,
    maxLabel,
    hint
}) {
    const isDisabled = bounds.min === bounds.max

    return (
        <div className="filter-section">
            <button className="section-header" onClick={() => onToggle(sectionKey)}>
                <span>{label}</span>
                <ChevronDown
                    size={14}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                />
            </button>

            {isOpen && (
                <div className="section-content">
                    <div className="range-summary">
                        <span>{formatValue(range.min)}</span>
                        <span>{formatValue(range.max)}</span>
                    </div>

                    <div className="dual-slider">
                        <div className="slider-row">
                            <span className="slider-label">{minLabel}</span>
                            <input
                                className="range-slider"
                                type="range"
                                min={bounds.min}
                                max={bounds.max}
                                step="1"
                                value={range.min}
                                disabled={isDisabled}
                                onChange={(event) => onChange('min', event.target.value, bounds)}
                            />
                            <span className="slider-value">{formatValue(range.min)}</span>
                        </div>

                        <div className="slider-row">
                            <span className="slider-label">{maxLabel}</span>
                            <input
                                className="range-slider"
                                type="range"
                                min={bounds.min}
                                max={bounds.max}
                                step="1"
                                value={range.max}
                                disabled={isDisabled}
                                onChange={(event) => onChange('max', event.target.value, bounds)}
                            />
                            <span className="slider-value">{formatValue(range.max)}</span>
                        </div>
                    </div>

                    {hint && <p className="filter-note">{hint}</p>}
                </div>
            )}
        </div>
    )
}

function Sidebar({
    filters,
    toggleLevel,
    toggleRefRange,
    toggleCity,
    toggleIndustry,
    updateRangeFilter,
    cityOptions,
    industryOptions,
    ratingBounds,
    certificateBounds,
    filteredCount,
    totalCount
}) {
    const { t } = useTranslation()
    const [openSections, setOpenSections] = useState({
        level: true,
        references: true,
        city: false,
        industry: false,
        satisfaction: false,
        certificates: false
    })

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    return (
        <MotionAside
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
                    <div className="section-content scrollable-filter-list">
                        {cityOptions.map(city => (
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

            <div className="sidebar-subheading">{t('sidebar.additionalFilters')}</div>

            <div className="filter-section">
                <button className="section-header" onClick={() => toggleSection('industry')}>
                    <span>{t('sidebar.industry')}</span>
                    <ChevronDown
                        size={14}
                        style={{ transform: openSections.industry ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                    />
                </button>

                {openSections.industry && (
                    <div className="section-content scrollable-filter-list">
                        {industryOptions.map(industry => (
                            <label key={industry} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedIndustries.includes(industry)}
                                    onChange={() => toggleIndustry(industry)}
                                />
                                <span>{industry}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <RangeFilterSection
                label={t('sidebar.satisfaction')}
                sectionKey="satisfaction"
                isOpen={openSections.satisfaction}
                onToggle={toggleSection}
                range={filters.ratingRange}
                bounds={ratingBounds}
                onChange={(boundary, value, bounds) => updateRangeFilter('ratingRange', boundary, value, bounds)}
                formatValue={(value) => `${value}%`}
                minLabel={t('sidebar.min')}
                maxLabel={t('sidebar.max')}
            />

            <RangeFilterSection
                label={t('sidebar.certificates')}
                sectionKey="certificates"
                isOpen={openSections.certificates}
                onToggle={toggleSection}
                range={filters.certificateRange}
                bounds={certificateBounds}
                onChange={(boundary, value, bounds) => updateRangeFilter('certificateRange', boundary, value, bounds)}
                formatValue={(value) => String(value)}
                minLabel={t('sidebar.min')}
                maxLabel={t('sidebar.max')}
            />

            <div className="sidebar-footer">
                <p className="disclaimer">
                    {t('sidebar.disclaimer')}
                </p>
            </div>
        </MotionAside>
    )
}

export default Sidebar
