import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { buildPartnerProfileUrl } from '../utils'
import { useTranslation } from 'react-i18next'
import ContactModal from './ContactModal'
import { getLevelLabel } from '../constants/partnerLevels'

function CompareModal({ isOpen, onClose, partners, onRemove }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [contactPartnerName, setContactPartnerName] = useState(null)

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const getMetricValue = (value, suffix = '') => {
    return value > 0 ? `${value} ${suffix}`.trim() : '—'
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
          onClick={(event) => event.stopPropagation()}
        >
          <div className="compare-header">
            <h2>{t('compareModal.title')}</h2>
            <button className="compare-close-btn" onClick={onClose} aria-label={t('compareModal.close')} type="button">
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
                <button className="btn-primary" onClick={onClose} type="button">{t('compareModal.backToList')}</button>
              </div>
            ) : (
              <div className={`compare-grid cols-${partners.length}`}>
                {partners.map((partner) => (
                  <div key={partner.name} className="compare-card">
                    <button
                      className="compare-remove-btn"
                      onClick={() => onRemove(partner.name)}
                      title={t('compareModal.removeFromCompare')}
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                    <div className="compare-card-header">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="compare-logo"
                          onError={(event) => { event.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="compare-logo-placeholder" />
                      )}

                      <h3>{partner.name}</h3>

                      <div className="compare-card-meta">
                        <span className={`level-badge ${partner.level?.toLowerCase()}`}>{getLevelLabel(partner.level, t)}</span>
                        <span className="compare-city">{partner.displayLocation}</span>
                      </div>
                    </div>

                    <div className="compare-metrics">
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.references')}</span>
                        <span className="compare-metric-value">{getMetricValue(partner.references)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.avgUsers')}</span>
                        <span className="compare-metric-value">{getMetricValue(partner.average_users)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.largeProject')}</span>
                        <span className="compare-metric-value">{partner.large_users > 0 ? `~${partner.large_users}` : '—'}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">{t('compareModal.metrics.experts')}</span>
                        <span className="compare-metric-value">{getMetricValue(partner.experts)}</span>
                      </div>

                      <div className="compare-action-row compare-action-row--stacked">
                        <button
                          className="compare-action-btn compare-action-btn--primary"
                          onClick={() => setContactPartnerName(partner.name)}
                          type="button"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {t('compareModal.buttons.contact')}
                        </button>

                        <button
                          className="compare-action-btn compare-action-btn--secondary"
                          onClick={() => { navigate(buildPartnerProfileUrl(partner)); onClose() }}
                          type="button"
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

export default CompareModal
