import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { generateSlug } from '../utils'
import { useTranslation } from 'react-i18next'
import ContactModal from './ContactModal'

export default function CompareModal({ isOpen, onClose, partners, onRemove }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [contactPartnerName, setContactPartnerName] = useState(null)
  // Close on Esc
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const getMetricValue = (val, suffix = '') => {
    return val > 0 ? `${val} ${suffix}`.trim() : '—'
  }

  return (
    <AnimatePresence>
      <div className="compare-overlay" onClick={onClose}>
        <motion.div
          className="compare-modal"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="compare-header">
            <h2>{t('compareModal.title')}</h2>
            <button className="compare-close-btn" onClick={onClose} aria-label={t('compareModal.close')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="compare-body">
            {partners.length === 0 ? (
              <div className="compare-empty">
                <p>{t('compareModal.emptyState')}</p>
                <button className="btn-primary" onClick={onClose}>{t('compareModal.backToList')}</button>
              </div>
            ) : (
              <div className={`compare-grid cols-${partners.length}`}>
                {partners.map(p => (
                  <div key={p.name} className="compare-card">
                    <button 
                      className="compare-remove-btn" 
                      onClick={() => onRemove(p.name)}
                      title={t('compareModal.removeFromCompare')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    
                    <div className="compare-card-header">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt={p.name} className="compare-logo" onError={e => e.target.style.display='none'} />
                      ) : <div className="compare-logo-placeholder" />}
                      <h3>{p.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`level-badge ${p.level?.toLowerCase()}`}>{p.level}</span>
                        <span className="compare-city">{p.displayCity || t('compareModal.turkey')}</span>
                      </div>
                    </div>

                    <div className="compare-metrics">
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.references')}</span>
                        <span className="compare-metric-value">{getMetricValue(p.references)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.avgUsers')}</span>
                        <span className="compare-metric-value">{getMetricValue(p.average_users)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.largeProject')}</span>
                        <span className="compare-metric-value">{p.large_users > 0 ? `~${p.large_users}` : '—'}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.experts')}</span>
                        <span className="compare-metric-value">{getMetricValue(p.experts)}</span>
                      </div>
                      <div className="compare-action-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
                        <button 
                          className="compare-btn-primary" 
                          onClick={() => setContactPartnerName(p.name)}
                          style={{ padding: '8px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          {t('compareModal.buttons.contact')}
                        </button>
                        <button 
                          className="compare-btn-secondary" 
                          onClick={() => { navigate(`/partners/${generateSlug(p.name)}`); onClose(); }}
                          style={{ padding: '8px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                        >
                          {t('compareModal.buttons.viewOnSite')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Contact Form Modal inside AnimatePresence */}
      {contactPartnerName && (
        <ContactModal 
          isOpen={!!contactPartnerName} 
          onClose={() => setContactPartnerName(null)} 
          partnerName={contactPartnerName} 
        />
      )}
    </AnimatePresence>
  )
}
