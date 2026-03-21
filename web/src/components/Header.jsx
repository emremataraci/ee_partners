import { Search, Map } from 'lucide-react'

function Header({ searchQuery, setSearchQuery, comparedPartners, onOpenCompare }) {
  return (
    <header className="header">
      <div className="logo">
        <Map size={22} />
        <div className="logo-text">
          <h1>Odoo Partner Keşif Haritası</h1>
        </div>
      </div>

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
