import { Search, Map, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LANGUAGE_OPTIONS = [
  { code: 'tr', label: 'TR', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'en', label: 'EN', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', nativeName: 'Deutsch' }
]

function Header({ searchQuery, setSearchQuery, comparedPartners, onOpenCompare, onToggleSidebar }) {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'tr').split('-')[0]

  return (
    <header className="header">
      <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label={t('header.menuAria')}>
        <Menu size={22} />
      </button>

      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="logo">
        <Map size={22} />
        <div className="logo-text">
          <h1>{t('header.title')}</h1>
        </div>
      </Link>

      <div className="header-center">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Spacer & Compare Action & Language Toggle */}
      <div className="header-right">
        {comparedPartners?.length > 0 && (
          <button 
            className="compare-header-btn" 
            onClick={onOpenCompare}
          >
            {t('header.compare', { count: comparedPartners.length })}
          </button>
        )}

        <div
          className="language-toggle"
          aria-label={t('header.languageSwitcher')}
        >
          {LANGUAGE_OPTIONS.map(({ code, label, flag, nativeName }) => {
            const isActive = currentLang === code

            return (
              <button
                key={code}
                type="button"
                aria-pressed={isActive}
                title={nativeName}
                className={`language-toggle-btn ${isActive ? 'language-toggle-btn--active' : ''}`}
                onClick={() => i18n.changeLanguage(code)}
              >
                <span className="language-toggle-flag" aria-hidden="true">{flag}</span>
                <span className="language-toggle-label">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default Header
