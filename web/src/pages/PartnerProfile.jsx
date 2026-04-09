import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { generateSlug } from '../utils'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import PartnerUpdateModal from '../components/PartnerUpdateModal'
import { getLevelLabel } from '../constants/partnerLevels'
import { loadPartnerLocaleContent, normalizeLanguage, getPartnerLocalizedField } from '../partnerContent'
import '../App.css'

export default function PartnerProfile() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams()
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [trContent, setTrContent] = useState({})
  const [activeLocaleContent, setActiveLocaleContent] = useState({})
  const currentLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language)

  useEffect(() => {
    // In production this might be an API call
    // Using relative path for Vite dev server / build 
    // We assume base is /ee_partners/ as per vite.config.js
    Promise.all([
      fetch('/ee_partners/odoo_partners.json').then(res => res.json()),
      loadPartnerLocaleContent('tr'),
      currentLanguage === 'tr' ? Promise.resolve({}) : loadPartnerLocaleContent(currentLanguage)
    ])
      .then(([data, defaultContent, localizedContent]) => {
        const normalizeCity = (city) => city ? city.split('/')[0].split(',')[0].trim() : null
        const found = data.partners.find(p => generateSlug(p.name) === slug)

        setTrContent(defaultContent)
        setActiveLocaleContent(currentLanguage === 'tr' ? defaultContent : localizedContent)

        if (found) {
          const rawCity = found.city === 'Türkiye' ? found.country : found.city
          setPartner({
            ...found,
            average_users: parseInt(found.average_project_size?.match(/\d+/)?.[0] || '0'),
            large_users: parseInt(found.large_project_size?.match(/\d+/)?.[0] || '0'),
            references: parseInt(found.references_count || '0'),
            experts: parseInt(found.certified_experts_count || '0'),
            displayCity: normalizeCity(rawCity)
          })
        } else {
          setPartner(null)
        }

        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading partner profile:', err)
        setLoading(false)
      })
  }, [slug, currentLanguage])

  // Set SEO meta title
  useEffect(() => {
    if (partner) {
      document.title = t('partnerProfile.meta.title', { partnerName: partner.name })
    }
    return () => {
      document.title = t('partnerProfile.meta.defaultTitle')
    }
  }, [partner, t, i18n.resolvedLanguage])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('partnerProfile.loading')}</p>
      </div>
    )
  }

  if (!partner) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h2>{t('partnerProfile.notFound.title')}</h2>
        <p>{t('partnerProfile.notFound.description')}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          {t('partnerProfile.notFound.back')}
        </Link>
      </div>
    )
  }



  // Helper for metrics
  const getMetric = (val, suffix = '') => val > 0 ? `${val} ${suffix}`.trim() : t('partnerProfile.unknown')
  const shortDescription = getPartnerLocalizedField(slug, activeLocaleContent, 'short_description')?.trim()
    || getPartnerLocalizedField(slug, trContent, 'short_description')?.trim()
  const aboutText = getPartnerLocalizedField(slug, activeLocaleContent, 'about_text')?.trim()
    || getPartnerLocalizedField(slug, trContent, 'about_text')?.trim()
  const detailDescription = aboutText || t('partnerProfile.aboutFallback')

  return (
    <div className="profile-page-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        {t('partnerProfile.backToMap')}
      </Link>

      <div className="profile-header-card" style={{ background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '32px', alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        {partner.logo_url ? (
          <img src={partner.logo_url} alt={partner.name} style={{ width: '120px', height: '120px', objectFit: 'contain', background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px' }} />
        ) : (
          <div style={{ width: '120px', height: '120px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>{t('partnerProfile.noLogo')}</div>
        )}
        
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: 'var(--text)' }}>{partner.name}</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <span className={`level-badge ${partner.level?.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
              {getLevelLabel(partner.level, t)}
            </span>
            {partner.displayCity && (
              <span style={{ color: 'var(--text-light)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                📍 {partner.displayCity}
              </span>
            )}
          </div>
          {shortDescription && (
            <p style={{ color: 'var(--text)', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
              {shortDescription}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--white)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            onClick={() => setIsUpdateModalOpen(true)}
          >
            {t('partnerUpdateModal.trigger')}
          </button>
        </div>
      </div>

      <div className="profile-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '24px' }}>
        <div className="metric-box" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #F59E0B', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>{t('partnerProfile.metrics.references')}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)' }}>{getMetric(partner.references)}</div>
        </div>
        <div className="metric-box" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10B981', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>{t('partnerProfile.metrics.avgUsers')}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)' }}>{getMetric(partner.average_users)}</div>
        </div>
        <div className="metric-box" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #6366F1', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>{t('partnerProfile.metrics.largeProject')}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)' }}>{getMetric(partner.large_users, '+')}</div>
        </div>
        <div className="metric-box" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8B5CF6', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>{t('partnerProfile.metrics.experts')}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)' }}>{getMetric(partner.experts)}</div>
        </div>
      </div>

      <div className="profile-section" style={{ marginTop: '32px', background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '20px' }}>{t('partnerProfile.sections.about')}</h3>
        <p style={{ color: 'var(--text)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{detailDescription}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px', marginTop: '32px' }}>
        
        {/* Sektörel Dağılım */}
        {partner.industries_breakdown && partner.industries_breakdown.length > 0 && (
          <div className="profile-section" style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--text)', fontSize: '20px' }}>{t('partnerProfile.sections.industries')}</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partner.industries_breakdown} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="industry" type="category" width={140} tick={{ fontSize: 12, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--bg)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Sertifikalar */}
        {partner.certifications_breakdown && partner.certifications_breakdown.length > 0 && (
          <div className="profile-section" style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--text)', fontSize: '20px' }}>{t('partnerProfile.sections.certifications')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {partner.certifications_breakdown.map((cert, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🏆</span>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{cert.version}</span>
                  </div>
                  <div style={{ background: 'var(--primary)', color: 'var(--text)', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                    {t('partnerProfile.certCount', { count: cert.count })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUpdateModalOpen && (
        <PartnerUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          partnerName={partner.name}
        />
      )}

    </div>
  )
}
