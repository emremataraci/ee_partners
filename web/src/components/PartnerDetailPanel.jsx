import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContactModal from './ContactModal'
import './ContactModal.css'

const TABS = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'competencies', label: 'Yetkinlikler' },
  { id: 'industries', label: 'Sektörler' },
  { id: 'footprint', label: 'Müşteri Ayak İzi' },
  { id: 'certifications', label: 'Sertifikalar & Ekip' },
]

const LEVEL_COLORS = {
  Gold: { bg: '#FFBF00', text: '#6b4c00' },
  Silver: { bg: '#ADCCED', text: '#1a3a5c' },
  Ready: { bg: '#FCA956', text: '#7a3500' },
  Learning: { bg: '#F3E5AB', text: '#5a4a00' },
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="detail-metric-card" style={{ '--metric-color': color }}>
      <div className="detail-metric-value">{value ?? '—'}</div>
      <div className="detail-metric-label">{label}</div>
      {sub && <div className="detail-metric-sub">{sub}</div>}
    </div>
  )
}

function ComingSoonTab({ label }) {
  return (
    <div className="detail-coming-soon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15v-4m0-4h.01" />
      </svg>
      <p><strong>{label}</strong> verisi yakında</p>
      <span>Scraper genişletildiğinde bu sekme dolacak.</span>
    </div>
  )
}

function PartnerDetailPanel({ partner, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isContactOpen, setIsContactOpen] = useState(false)

  // Reset tab when partner changes
  useEffect(() => {
    setActiveTab('overview')
  }, [partner?.name])

  // Esc key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const levelStyle = LEVEL_COLORS[partner?.level] || LEVEL_COLORS.Ready

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="detail-overview">
            {/* Metric Cards */}
            <div className="detail-metrics-grid">
              <MetricCard
                label="Referans"
                value={partner.references > 0 ? partner.references : '—'}
                color="#875BF7"
              />
              <MetricCard
                label="Ort. Kullanıcı"
                value={partner.average_users > 0 ? partner.average_users : '—'}
                color="#3498DB"
              />
              <MetricCard
                label="Büyük Proje"
                value={partner.large_users > 0 ? `~${partner.large_users}` : '—'}
                sub="kullanıcı"
                color="#27AE60"
              />
              <MetricCard
                label="Sertifikalı Uzman"
                value={partner.experts > 0 ? partner.experts : '—'}
                color="#E67E22"
              />
            </div>

            {/* Info rows */}
            <div className="detail-info-section">
              <div className="detail-info-title">Genel Bilgiler</div>
              <div className="detail-info-rows">
                <div className="detail-info-row">
                  <span className="detail-info-key">Seviye</span>
                  <span
                    className={`level-badge ${partner.level?.toLowerCase()}`}
                  >
                    {partner.level}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-info-key">Şehir</span>
                  <span className="detail-info-val">{partner.displayCity || 'Türkiye'}</span>
                </div>
                {partner.full_address && (
                  <div className="detail-info-row">
                    <span className="detail-info-key">Adres</span>
                    <span className="detail-info-val detail-info-val--wrap">{partner.full_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'competencies':
        return <ComingSoonTab label="Yetkinlikler & Modüller" />
      case 'industries':
        return <ComingSoonTab label="Sektörler" />
      case 'footprint':
        return <ComingSoonTab label="Müşteri Ayak İzi" />
      case 'certifications':
        return <ComingSoonTab label="Sertifikalar & Ekip" />
      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence>
        {partner && (
          <>
            {/* Backdrop */}
          <motion.div
            className="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Slide-over Panel */}
          <motion.div
            className="detail-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Panel Header */}
            <div className="detail-panel-header">
              <div className="detail-partner-identity">
                {partner.logo_url && (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="detail-logo"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="detail-partner-meta">
                  <h2 className="detail-partner-name">{partner.name}</h2>
                  <div className="detail-partner-sub">
                    <span
                      className={`level-badge ${partner.level?.toLowerCase()}`}
                    >
                      {partner.level}
                    </span>
                    {partner.displayCity && (
                      <span className="detail-partner-city">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        {partner.displayCity}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-header-actions">
                <button
                  className="detail-profile-btn contact-btn"
                  onClick={() => setIsContactOpen(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  İletişime Geç
                </button>
                <button className="detail-close-btn" onClick={onClose} aria-label="Kapat">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`detail-tab ${activeTab === tab.id ? 'detail-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="detail-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
      {partner && (
        <ContactModal 
          isOpen={isContactOpen} 
          onClose={() => setIsContactOpen(false)} 
          partnerName={partner.name} 
        />
      )}
    </>
  )
}

export default PartnerDetailPanel
