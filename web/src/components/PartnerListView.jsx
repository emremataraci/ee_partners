import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import EmptyState from './EmptyState'
import { useTranslation } from 'react-i18next'

const LEVEL_ORDER = { Gold: 0, Silver: 1, Ready: 2, Learning: 3 }

const SortIcon = ({ column, sortKey, sortDir }) => {
  if (sortKey !== column) {
    return (
      <svg className="sort-icon sort-icon--inactive" width="10" height="10" viewBox="0 0 10 14" fill="none">
        <path d="M5 1L1 5h8L5 1zM5 13L1 9h8L5 13z" fill="currentColor" />
      </svg>
    )
  }
  return sortDir === 'asc' ? (
    <svg className="sort-icon sort-icon--active" width="10" height="10" viewBox="0 0 10 14" fill="none">
      <path d="M5 1L1 7h8L5 1z" fill="currentColor" />
    </svg>
  ) : (
    <svg className="sort-icon sort-icon--active" width="10" height="10" viewBox="0 0 10 14" fill="none">
      <path d="M5 13L1 7h8L5 13z" fill="currentColor" />
    </svg>
  )
}

function PartnerListView({ partners, onPartnerClick, comparedPartners, onToggleCompare, areaMetric }) {
  const [sortKey, setSortKey] = useState(areaMetric || 'references')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    if (areaMetric) {
      setSortKey(areaMetric)
      setSortDir('desc')
    }
  }, [areaMetric])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...partners].sort((a, b) => {
      let aVal, bVal
      if (sortKey === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (sortKey === 'level') {
        aVal = LEVEL_ORDER[a.level] ?? 99
        bVal = LEVEL_ORDER[b.level] ?? 99
      } else if (sortKey === 'city') {
        aVal = (a.displayCity || '').toLowerCase()
        bVal = (b.displayCity || '').toLowerCase()
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      } else {
        aVal = a[sortKey] ?? 0
        bVal = b[sortKey] ?? 0
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [partners, sortKey, sortDir])

  const { t } = useTranslation()
  const cols = [
    { key: 'name', label: t('listView.columns.partner'), width: '30%' },
    { key: 'level', label: t('listView.columns.level'), width: '10%' },
    { key: 'city', label: t('listView.columns.city'), width: '12%' },
    { key: 'references', label: t('listView.columns.references'), width: '12%' },
    { key: 'average_users', label: t('listView.columns.avgUsers'), width: '14%' },
    { key: 'large_users', label: t('listView.columns.largeProject'), width: '14%' },
    { key: 'experts', label: t('listView.columns.expert'), width: '8%' },
  ]

  if (!partners.length) {
    return (
      <div className="partner-list-wrapper">
        <EmptyState message={t('listView.emptyState')} />
      </div>
    )
  }

  return (
    <div className="partner-list-wrapper">
      <div className="partner-list-info">
        <span className="partner-list-count">{t('listView.countMsg', { count: partners.length })}</span>
        <span className="partner-list-hint">{t('listView.hintMsg')}</span>
      </div>
      <div className="partner-table-container">
        <table className="partner-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th style={{ width: '40px', textAlign: 'center', opacity: 0.7 }}>{t('listView.columns.compare')}</th>
              {cols.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key)}
                  className={`th-sortable ${sortKey === col.key ? 'th-active' : ''}`}
                >
                  <span>{col.label}</span>
                  <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((partner, idx) => (
              <motion.tr
                key={partner.name}
                className="partner-row"
                onClick={() => onPartnerClick(partner)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.5) }}
              >
                <td className="td-rank">{idx + 1}</td>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={!!comparedPartners?.find(p => p.name === partner.name)}
                    onChange={() => onToggleCompare(partner)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                </td>
                <td className="td-name">
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="partner-logo-small"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                  <span className="partner-name-text">{partner.name}</span>
                </td>
                <td>
                  <span className={`level-badge ${partner.level?.toLowerCase()}`}>
                    {partner.level}
                  </span>
                </td>
                <td className="td-city">{partner.displayCity || '—'}</td>
                <td className="td-metric">
                  {partner.references > 0
                    ? <span className="metric-pill metric-pill--ref">{partner.references}</span>
                    : <span className="metric-zero">—</span>
                  }
                </td>
                <td className="td-metric">
                  {partner.average_users > 0
                    ? <span className="metric-pill metric-pill--user">{partner.average_users}</span>
                    : <span className="metric-zero">—</span>
                  }
                </td>
                <td className="td-metric">
                  {partner.large_users > 0
                    ? <span className="metric-pill metric-pill--large">{partner.large_users}</span>
                    : <span className="metric-zero">—</span>
                  }
                </td>
                <td className="td-metric">
                  {partner.experts > 0
                    ? <span className="metric-pill metric-pill--expert">{partner.experts}</span>
                    : <span className="metric-zero">—</span>
                  }
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PartnerListView
