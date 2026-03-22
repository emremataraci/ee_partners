import { motion } from 'framer-motion'
import './Skeleton.css'

export default function Skeleton() {
  return (
    <div className="skeleton-container">
      {/* Header Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-box logo-skeleton" />
        <div className="skeleton-box search-skeleton" />
      </div>

      <div className="skeleton-main">
        {/* Sidebar Skeleton */}
        <div className="skeleton-sidebar">
          <div className="skeleton-box sidebar-title" />
          <div className="skeleton-box widget-skeleton" />
          <div className="skeleton-box filter-skeleton" />
          <div className="skeleton-box filter-skeleton" />
          <div className="skeleton-box filter-skeleton" />
        </div>

        {/* Content Skeleton */}
        <div className="skeleton-content">
          <div className="skeleton-controls">
            <div className="skeleton-box toggle-skeleton" />
            <div className="skeleton-box tools-skeleton" />
          </div>
          <div className="skeleton-box chart-skeleton" />
        </div>
      </div>
    </div>
  )
}
