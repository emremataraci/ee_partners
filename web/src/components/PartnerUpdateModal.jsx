import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './ContactModal.css'

const MotionDiv = motion.div

const createInitialForm = (partnerName) => ({
  partnerName,
  contactName: '',
  phone: '',
  email: '',
  message: ''
})

export default function PartnerUpdateModal({ isOpen, onClose, partnerName }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState(() => createInitialForm(partnerName))
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const handler = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isSubmitted) return undefined

    const timeoutId = window.setTimeout(() => {
      onClose()
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [isSubmitted, onClose])

  if (!isOpen) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Partner profile update request', formData)
    setIsSubmitted(true)
  }

  return (
    <AnimatePresence>
      <div className="contact-modal-overlay" onClick={onClose}>
        <MotionDiv
          className="contact-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="contact-modal-header">
            <h3>{t('partnerUpdateModal.title')}</h3>
            <button className="contact-modal-close" onClick={onClose} aria-label={t('partnerUpdateModal.close')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="contact-modal-body">
            {isSubmitted ? (
              <MotionDiv
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
                <h4>{t('partnerUpdateModal.success.title')}</h4>
                <p>{t('partnerUpdateModal.success.description', { partnerName })}</p>
              </MotionDiv>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <p className="contact-form-helper">{t('partnerUpdateModal.description')}</p>

                <div className="form-group">
                  <label htmlFor="partnerName">{t('partnerUpdateModal.form.partnerName')}</label>
                  <input
                    type="text"
                    id="partnerName"
                    name="partnerName"
                    value={formData.partnerName}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactName">{t('partnerUpdateModal.form.contactName')}</label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder={t('partnerUpdateModal.form.contactNamePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('partnerUpdateModal.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('partnerUpdateModal.form.emailPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t('partnerUpdateModal.form.phone')}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('partnerUpdateModal.form.phonePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('partnerUpdateModal.form.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('partnerUpdateModal.form.messagePlaceholder')}
                  />
                </div>

                <button type="submit" className="submit-btn">
                  {t('partnerUpdateModal.form.submit')}
                </button>
              </form>
            )}
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  )
}
