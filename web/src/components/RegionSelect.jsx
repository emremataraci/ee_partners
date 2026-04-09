import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { REGION_OPTIONS, getRegionDisplayName, getRegionFlag } from '../constants/regions'

function RegionSelect({ selectedRegion, onChange }) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const language = (i18n.resolvedLanguage || i18n.language || 'tr').split('-')[0]

  const options = useMemo(() => (
    REGION_OPTIONS.map((option) => ({
      ...option,
      flag: getRegionFlag(option.code),
      label: getRegionDisplayName(option.code, language)
    }))
  ), [language])

  const activeOption = options.find((option) => option.code === selectedRegion) || options[0]

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language)

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.fallbackName} ${option.countryCode} ${option.code}`
        .toLocaleLowerCase(language)
      return haystack.includes(normalizedQuery)
    })
  }, [language, options, query])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      return
    }

    searchInputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className={`region-select ${isOpen ? 'region-select--open' : ''}`} ref={containerRef}>
      <span className="region-select-label">{t('header.regionLabel')}</span>

      <button
        type="button"
        className="region-select-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('header.regionSwitcher')}
      >
        <span className="region-select-flag" aria-hidden="true">{activeOption.flag}</span>
        <span className="region-select-value">{activeOption.label}</span>
        <ChevronDown size={16} className="region-select-chevron" />
      </button>

      {isOpen && (
        <div className="region-select-popover">
          <div className="region-select-search">
            <Search size={15} className="region-select-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="region-select-search-input"
              placeholder={t('header.regionSearchPlaceholder')}
            />
          </div>

          <div className="region-select-options" role="listbox" aria-label={t('header.regionSwitcher')}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isActive = option.code === activeOption.code

                return (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`region-option ${isActive ? 'region-option--active' : ''}`}
                    onClick={() => {
                      onChange(option.code)
                      setIsOpen(false)
                    }}
                  >
                    <span className="region-option-flag" aria-hidden="true">{option.flag}</span>
                    <span className="region-option-label">{option.label}</span>
                    <span className="region-option-code">{option.countryCode}</span>
                  </button>
                )
              })
            ) : (
              <div className="region-option-empty">{t('header.regionNoResults')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RegionSelect
