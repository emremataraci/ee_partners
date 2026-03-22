import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ContactModal({ isOpen, onClose, partnerName }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    consent: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', company: '', phone: '', email: '', consent: false })
      setIsSubmitted(false)
    }
  }, [isOpen])

  // Esc key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulated API call
    console.log('Form submitted for', partnerName, formData)
    setIsSubmitted(true)
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="contact-modal-overlay">
        <motion.div
          className="contact-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="contact-modal-header">
            <h3>{t('contactModal.title', { partnerName })}</h3>
            <button className="contact-modal-close" onClick={onClose} aria-label={t('contactModal.close')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="contact-modal-body">
            {isSubmitted ? (
              <motion.div 
                className="contact-success-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4>{t('contactModal.success.title')}</h4>
                <p>{t('contactModal.success.descPart1')}<strong>{partnerName}</strong>{t('contactModal.success.descPart2')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">{t('contactModal.form.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contactModal.form.namePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">{t('contactModal.form.company')}</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('contactModal.form.companyPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t('contactModal.form.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contactModal.form.phonePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contactModal.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contactModal.form.emailPlaceholder')}
                  />
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                    />
                    <span>
                      {t('contactModal.form.consentPart1')}<strong>{partnerName}</strong>{t('contactModal.form.consentPart2')}
                    </span>
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={!formData.consent}>
                  {t('contactModal.form.submit')}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
