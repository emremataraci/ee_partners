import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import emailjs from '@emailjs/browser'
import './ContactModal.css'

const APP_NAME = 'ee - best partner finder'
const EMAILJS_SERVICE_ID = 'service_6e1uavf'
const EMAILJS_TEMPLATE_ID = 'template_gnsb30p'
const EMAILJS_PUBLIC_KEY = 'y5_s9_addnsiDKMv7'
const INITIAL_FORM_DATA = {
  name: '',
  company: '',
  phone: '',
  email: '',
  message: '',
  consent: false
}

export default function ContactModal({ isOpen, onClose, partnerName }) {
  const { t } = useTranslation()
  const formRef = useRef(null)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA)
      setIsSubmitted(false)
      setIsSubmitting(false)
      setSubmitError('')
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (submitError) {
      setSubmitError('')
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const missingConfigFields = [
    [EMAILJS_SERVICE_ID, t('contactModal.error.fields.serviceId')],
    [EMAILJS_TEMPLATE_ID, t('contactModal.error.fields.templateId')],
    [EMAILJS_PUBLIC_KEY, t('contactModal.error.fields.publicKey')]
  ]
    .filter(([value]) => value.startsWith('YOUR_EMAILJS_'))
    .map(([, label]) => label)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (missingConfigFields.length > 0) {
      setSubmitError(t('contactModal.error.config', {
        appName: APP_NAME,
        fields: missingConfigFields.join(', ')
      }))
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: EMAILJS_PUBLIC_KEY }
      )

      setFormData(INITIAL_FORM_DATA)
      setIsSubmitted(true)
    } catch (error) {
      console.error('EmailJS send failed', error)
      setSubmitError(t('contactModal.error.default'))
    } finally {
      setIsSubmitting(false)
    }
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
              <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
                <p className="contact-form-helper">
                  {t('contactModal.helper', { appName: APP_NAME, partnerName })}
                </p>

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

                <div className="form-group">
                  <label htmlFor="message">{t('contactModal.form.needsDescription')}</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contactModal.form.needsDescriptionPlaceholder')}
                  />
                </div>

                <input type="hidden" name="partner_name" value={partnerName} readOnly />
                <input type="hidden" name="project_name" value={APP_NAME} readOnly />

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

                {submitError ? (
                  <p className="contact-form-alert contact-form-alert--error" role="alert">
                    {submitError}
                  </p>
                ) : null}

                <button type="submit" className="submit-btn" disabled={!formData.consent || isSubmitting}>
                  {isSubmitting ? t('contactModal.form.submitting') : t('contactModal.form.submit')}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
