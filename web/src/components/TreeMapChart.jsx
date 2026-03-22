import { useMemo, useState, useRef, useEffect } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import EmptyState from './EmptyState'

// Brand palette per level
const LEVEL_COLORS = {
    Gold: '#F59E0B',
    Silver: '#94A3B8',
    Ready: '#10B981',
    Learning: '#8B5CF6',
}

// Darken hex color by a ratio (0 = original, 1 = black)
const darkenHex = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (num >> 16) - Math.round(255 * amount))
    const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount))
    const b = Math.max(0, (num & 0xff) - Math.round(255 * amount))
    return `rgb(${r},${g},${b})`
}

// Get shade based on metric value (higher = less darkened = more vivid)
const getColorWithShade = (level, value, maxValue) => {
    const base = LEVEL_COLORS[level] || LEVEL_COLORS.Ready
    const ratio = Math.min(value / Math.max(maxValue, 1), 1)
    // top value = 0% darkened, min = 20% darkened
    const darken = (1 - ratio) * 0.15
    return darkenHex(base, darken)
}

import { useTranslation } from 'react-i18next'

const CustomizedContent = (props) => {
    const { x, y, width, height, name, level, references, average_users, districtValue, index, depth, maxMetric, areaMetric, onPartnerClick, originalData } = props
    const { t } = useTranslation()

    if (depth === 0) return null

    // Gutter spacing
    const gutter = 4
    const rx = x + gutter
    const ry = y + gutter
    const rw = Math.max(width - gutter * 2, 0)
    const rh = Math.max(height - gutter * 2, 0)

    if (rw < 15 || rh < 12) return null

    const color = getColorWithShade(level, references, maxMetric)

    // All boxes show name if possible, just adjust font size
    const canShowText = rw > 35 && rh > 20
    const canShowStats = rw > 70 && rh > 45

    // Dynamic font size based on box size
    const getFontSize = () => {
        if (rw > 180 && rh > 60) return 16
        if (rw > 100 && rh > 45) return 14
        if (rw > 60 && rh > 30) return 12
        return 10
    }

    // Dynamic stat display based on selected metric
    const getStatDisplay = () => {
        if (areaMetric === 'average_users') {
            return average_users > 0 ? `${average_users} ${t('treeMap.users')}` : null
        } else {
            return references > 0 ? `${references} ${t('treeMap.ref')}` : null
        }
    }

    const statDisplay = getStatDisplay()

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            style={{ cursor: 'pointer' }}
            onClick={() => onPartnerClick && onPartnerClick(originalData)}
        >
            <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill={color}
                rx={6}
            />

            {canShowText && (
                <foreignObject x={rx} y={ry} width={rw} height={rh} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        padding: '6px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }}>
                        <div style={{
                            fontSize: getFontSize(),
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }} title={name}>
                            {name}
                        </div>
                        {canShowStats && statDisplay && (
                            <div style={{
                                fontSize: Math.max(getFontSize() - 3, 10),
                                fontWeight: '500',
                                marginTop: '4px',
                                color: 'rgba(255,255,255,0.9)'
                            }}>
                                {statDisplay}
                            </div>
                        )}
                    </div>
                </foreignObject>
            )}
        </motion.g>
    )
}

function TreeMapChart({ partners, areaMetric, onPartnerClick }) {
    const { t } = useTranslation()
    const [tooltipData, setTooltipData] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)

    // Calculate max for sizing — depends on selected metric
    const maxMetric = useMemo(() => {
        if (areaMetric === 'average_users') {
            return Math.max(...partners.map(p => p.average_users), 1)
        }
        return Math.max(...partners.map(p => p.references), 1)
    }, [partners, areaMetric])

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return

            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const tooltipWidth = 220
            const tooltipHeight = 180

            let posX = e.clientX + 16
            let posY = e.clientY + 16

            // Boundary detection
            if (e.clientX + tooltipWidth + 30 > viewportWidth) {
                posX = e.clientX - tooltipWidth - 16
            }
            if (e.clientY + tooltipHeight + 30 > viewportHeight) {
                posY = e.clientY - tooltipHeight - 16
            }

            setTooltipPos({ x: posX, y: posY })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const chartData = useMemo(() => {
        if (!partners.length) return []

        return partners
            .map((p, index) => {
                // Use references or district for sizing
                let sizeValue
                if (areaMetric === 'average_users') {
                    sizeValue = Math.max(p.average_users, 1)
                } else {
                    sizeValue = Math.max(p.references, 1)
                }

                return {
                    name: p.name,
                    size: sizeValue,
                    level: p.level,
                    references: p.references,
                    average_users: p.average_users,
                    districtValue: p.districtValue,
                    large_users: p.large_users,
                    experts: p.experts,
                    displayCity: p.displayCity,
                    profile_url: p.profile_url,
                    index,
                    maxMetric,
                    originalData: p
                }
            })
            .sort((a, b) => b.size - a.size)
    }, [partners, areaMetric, maxMetric])

    const handleMouseEnter = (data) => {
        if (data && data.name) {
            setTooltipData(data)
        }
    }

    const handleMouseLeave = () => {
        setTooltipData(null)
    }

    if (!partners.length) {
        return (
            <div className="treemap-empty">
                <EmptyState message={t('treeMap.emptyState')} />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="treemap-wrapper"
            onMouseLeave={handleMouseLeave}
        >
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={chartData}
                    dataKey="size"
                    stroke="transparent"
                    content={<CustomizedContent maxMetric={maxMetric} areaMetric={areaMetric} onPartnerClick={onPartnerClick} />}
                    onMouseEnter={(data) => handleMouseEnter(data)}
                    isAnimationActive={false}
                />
            </ResponsiveContainer>

            {/* Floating tooltip */}
            {tooltipData && (
                <div
                    className="floating-tooltip"
                    style={{
                        position: 'fixed',
                        left: tooltipPos.x,
                        top: tooltipPos.y
                    }}
                >
                    <div className="tooltip-name">{tooltipData.name}</div>
                    <div className="tooltip-level" data-level={tooltipData.level?.toLowerCase()}>
                        {tooltipData.level}
                    </div>
                    <div className="tooltip-details">
                        <div className="tooltip-row">
                            <span>{t('treeMap.location')}</span>
                            <span>{tooltipData.displayCity || t('treeMap.turkey')}</span>
                        </div>
                        <div className="tooltip-row">
                            <span>{t('treeMap.avgUsers')}</span>
                            <span>{tooltipData.average_users > 0 ? tooltipData.average_users : '-'}</span>
                        </div>
                        {tooltipData.references > 0 && (
                            <div className="tooltip-row">
                                <span>{t('treeMap.reference')}</span>
                                <span>{tooltipData.references}</span>
                            </div>
                        )}
                        {tooltipData.experts > 0 && (
                            <div className="tooltip-row">
                                <span>{t('treeMap.experts')}</span>
                                <span>{tooltipData.experts}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TreeMapChart
