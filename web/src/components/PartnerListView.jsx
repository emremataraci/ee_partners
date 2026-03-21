import { useState, useMemo } from 'react'

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

function PartnerListView({ partners, onPartnerClick, comparedPartners, onToggleCompare }) {
  const [sortKey, setSortKey] = useState('references')
  const [sortDir, setSortDir] = useState('desc')

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

  const cols = [
    { key: 'name', label: 'Partner', width: '30%' },
    { key: 'level', label: 'Seviye', width: '10%' },
    { key: 'city', label: 'Şehir', width: '12%' },
    { key: 'references', label: 'Referans', width: '12%' },
    { key: 'average_users', label: 'Ort. Kullanıcı', width: '14%' },
    { key: 'large_users', label: 'Büyük Proje', width: '14%' },
    { key: 'experts', label: 'Uzman', width: '8%' },
  ]

  if (!partners.length) {
    return (
      <div className="list-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <p>Filtrelere uygun partner bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="partner-list-wrapper">
      <div className="partner-list-info">
        <span className="partner-list-count">{partners.length} partner listeleniyor</span>
        <span className="partner-list-hint">Kolona tıklayarak sıralayabilirsiniz · Satıra tıklayarak detay görebilirsiniz</span>
      </div>
      <div className="partner-table-container">
        <table className="partner-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th style={{ width: '40px', textAlign: 'center', opacity: 0.7 }}>Kıyasla</th>
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
              <tr
                key={partner.name}
                className="partner-row"
                onClick={() => onPartnerClick(partner)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PartnerListView
