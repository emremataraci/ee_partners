import { motion } from 'framer-motion'

export default function EmptyState({ message = "Aradığınız kriterlere uygun partner bulunamadı." }) {
  return (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-state-icon-wrapper">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <path d="M14 9l3 3-3 3"></path>
          <path d="M4 14l2-2-2-2"></path>
        </svg>
      </div>
      <h3>Sonuç Bulunamadı</h3>
      <p>{message}</p>
      <div className="empty-state-decoration"></div>
    </motion.div>
  )
}
