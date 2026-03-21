import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompareModal({ isOpen, onClose, partners, onRemove }) {
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
            <h2>Partner Karşılaştırma</h2>
            <button className="compare-close-btn" onClick={onClose} aria-label="Kapat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="compare-body">
            {partners.length === 0 ? (
              <div className="compare-empty">
                <p>Karşılaştırmak için henüz partner seçmediniz.</p>
                <button className="btn-primary" onClick={onClose}>Listeye Dön</button>
              </div>
            ) : (
              <div className={`compare-grid cols-${partners.length}`}>
                {partners.map(p => (
                  <div key={p.name} className="compare-card">
                    <button 
                      className="compare-remove-btn" 
                      onClick={() => onRemove(p.name)}
                      title="Karşılaştırmadan Çıkar"
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
                        <span className="compare-city">{p.displayCity || 'Türkiye'}</span>
                      </div>
                    </div>

                    <div className="compare-metrics">
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">Referans Sayısı</span>
                        <span className="compare-metric-value">{getMetricValue(p.references)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">Ortalama Kullanıcı</span>
                        <span className="compare-metric-value">{getMetricValue(p.average_users)}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">Büyük Proje Kullanıcısı</span>
                        <span className="compare-metric-value">{p.large_users > 0 ? `~${p.large_users}` : '—'}</span>
                      </div>
                      <div className="compare-metric-row">
                        <span className="compare-metric-label">Sertifikalı Uzman</span>
                        <span className="compare-metric-value">{getMetricValue(p.experts)}</span>
                      </div>
                      {p.profile_url && (
                        <div className="compare-action-row">
                           <a href={p.profile_url} target="_blank" rel="noopener noreferrer" className="compare-profile-link">Odoo Profili ↗</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
