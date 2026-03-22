import { Search, Map, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Header({ searchQuery, setSearchQuery, comparedPartners, onOpenCompare, onToggleSidebar }) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.resolvedLanguage || i18n.language

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
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="language-toggle" style={{ display: 'flex', gap: '4px', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px' }}>
          <button 
            onClick={() => i18n.changeLanguage('tr')} 
            style={{ padding: '4px 8px', border: 'none', background: currentLang?.includes('tr') ? 'var(--accent)' : 'transparent', color: currentLang?.includes('tr') ? 'white' : 'var(--text-light)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            TR
          </button>
          <button 
            onClick={() => i18n.changeLanguage('en')} 
            style={{ padding: '4px 8px', border: 'none', background: currentLang?.includes('en') ? 'var(--accent)' : 'transparent', color: currentLang?.includes('en') ? 'white' : 'var(--text-light)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            EN
          </button>
        </div>

        {comparedPartners?.length > 0 && (
          <button 
            className="compare-header-btn" 
            onClick={onOpenCompare}
          >
            {t('header.compare', { count: comparedPartners.length })}
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
