import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ContactModal from './ContactModal'
import './ContactModal.css'
import { generateSlug } from '../utils'

const TABS = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'competencies', label: 'Yetkinlikler' },
  { id: 'industries', label: 'Sektörler' },
  { id: 'certifications', label: 'Sertifikalar & Ekip' },
]

const LEVEL_COLORS = {
  Gold: { bg: '#F59E0B', text: '#FEF3C7' },
  Silver: { bg: '#94A3B8', text: '#F1F5F9' },
  Ready: { bg: '#10B981', text: '#D1FAE5' },
  Learning: { bg: '#8B5CF6', text: '#EDE9FE' },
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
  const { t } = useTranslation()
  return (
    <div className="detail-coming-soon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15v-4m0-4h.01" />
      </svg>
      <p><strong>{label}</strong> {t('detailPanel.comingSoon.soon')}</p>
    </div>
  )
}

function PartnerDetailPanel({ partner, onClose, comparedPartners, onToggleCompare }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [isContactOpen, setIsContactOpen] = useState(false)
  const navigate = useNavigate()

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
                label={t('detailPanel.metrics.references')}
                value={partner.references > 0 ? partner.references : '—'}
                color="#875BF7"
              />
              <MetricCard
                label={t('detailPanel.metrics.avgUsers')}
                value={partner.average_users > 0 ? partner.average_users : '—'}
                color="#3498DB"
              />
              <MetricCard
                label={t('detailPanel.metrics.largeProject')}
                value={partner.large_users > 0 ? `~${partner.large_users}` : '—'}
                sub={t('detailPanel.metrics.userSub')}
                color="#27AE60"
              />
              <MetricCard
                label={t('detailPanel.metrics.experts')}
                value={partner.experts > 0 ? partner.experts : '—'}
                color="#E67E22"
              />
            </div>

            {/* Info rows */}
            <div className="detail-info-section">
              <div className="detail-info-title">{t('detailPanel.info.title')}</div>
              <div className="detail-info-rows">
                <div className="detail-info-row">
                  <span className="detail-info-key">{t('detailPanel.info.level')}</span>
                  <span
                    className={`level-badge ${partner.level?.toLowerCase()}`}
                  >
                    {partner.level}
                  </span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-info-key">{t('detailPanel.info.city')}</span>
                  <span className="detail-info-val">{partner.displayCity || t('detailPanel.info.turkey')}</span>
                </div>
                {partner.full_address && (
                  <div className="detail-info-row">
                    <span className="detail-info-key">{t('detailPanel.info.address')}</span>
                    <span className="detail-info-val detail-info-val--wrap">{partner.full_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'competencies':
        return <ComingSoonTab label={t('detailPanel.comingSoon.competencies')} />
      case 'industries':
        return <ComingSoonTab label={t('detailPanel.tabs.industries')} />
      case 'certifications':
        return <ComingSoonTab label={t('detailPanel.tabs.certifications')} />
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
            <div className="detail-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              
              {/* Top Row: Identity + Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div className="detail-partner-identity" style={{ flex: 1, paddingRight: '16px' }}>
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
                      <span className={`level-badge ${partner.level?.toLowerCase()}`}>
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

                <button className="detail-close-btn" onClick={onClose} aria-label="Kapat" style={{ flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Bottom Row: Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%' }}>
                <button
                  className="detail-profile-btn"
                  onClick={() => onToggleCompare(partner)}
                  style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    background: comparedPartners?.find(p => p.name === partner.name) ? '#EF4444' : 'var(--bg)', 
                    color: comparedPartners?.find(p => p.name === partner.name) ? '#fff' : 'inherit',
                    border: '1px solid var(--border)'
                  }}
                >
                  {comparedPartners?.find(p => p.name === partner.name) ? t('detailPanel.buttons.removeCompare') : t('detailPanel.buttons.addCompare')}
                </button>
                <button
                  className="detail-profile-btn contact-btn"
                  onClick={() => setIsContactOpen(true)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {t('detailPanel.buttons.contact')}
                </button>
              </div>
              <div style={{ marginTop: '12px', width: '100%' }}>
                <button
                  className="detail-profile-btn"
                  onClick={() => navigate(`/partners/${generateSlug(partner.name)}`)}
                  style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text)' }}
                >
                  {t('detailPanel.buttons.fullPage')}
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
                  {t(`detailPanel.tabs.${tab.id}`)}
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
