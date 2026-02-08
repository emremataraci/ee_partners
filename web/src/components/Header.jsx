import { motion } from 'framer-motion'
import { Search, Map } from 'lucide-react'

function Header({ searchQuery, setSearchQuery }) {
  return (
    <header className="header">
      <div className="logo">
        <Map size={22} />
        <div className="logo-text">
          <h1>Odoo Partner Haritası</h1>
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
      
      <div className="header-right">
        {/* Legend moved to sidebar - header is cleaner now */}
      </div>
    </header>
  )
}

export default Header
