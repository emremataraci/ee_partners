import { Search, Map, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

function Header({ searchQuery, setSearchQuery, comparedPartners, onOpenCompare, onToggleSidebar }) {
  return (
    <header className="header">
      <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Menüyü aç">
        <Menu size={22} />
      </button>

      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="logo">
        <Map size={22} />
        <div className="logo-text">
          <h1>Odoo Partner Keşif Haritası</h1>
        </div>
      </Link>

      <div className="header-center">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Partner ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Spacer & Compare Action */}
      <div className="header-right">
        {comparedPartners?.length > 0 && (
          <button 
            className="compare-header-btn" 
            onClick={onOpenCompare}
          >
            Karşılaştır ({comparedPartners.length}/3)
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
