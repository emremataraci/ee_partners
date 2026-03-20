import { useMemo, useState, useRef, useEffect } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

// Brand palette per level
const LEVEL_COLORS = {
    Gold: '#FFBF00',
    Silver: '#ADCCED',
    Ready: '#FCA956',
    Learning: '#F3E5AB',
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

const CustomizedContent = (props) => {
    const { x, y, width, height, name, level, references, average_users, districtValue, index, depth, maxMetric, areaMetric, onPartnerClick, originalData } = props

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
        if (rw > 150 && rh > 60) return 13
        if (rw > 100 && rh > 45) return 11
        if (rw > 60 && rh > 30) return 9
        return 8
    }

    // Truncate name based on available width
    const getMaxChars = () => {
        if (rw > 180) return 28
        if (rw > 140) return 22
        if (rw > 100) return 16
        if (rw > 70) return 12
        return 8
    }

    const truncateName = (str, maxLen) => {
        if (!str) return ''
        return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str
    }

    const fontSize = getFontSize()
    const maxChars = getMaxChars()

    // Dynamic stat display based on selected metric
    const getStatDisplay = () => {
        if (areaMetric === 'average_users') {
            return average_users > 0 ? `${average_users} Kullanıcı` : null
        } else {
            return references > 0 ? `${references} Ref` : null
        }
    }

    const statDisplay = getStatDisplay()

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            style={{ cursor: 'pointer' }}
            onClick={() => onPartnerClick && onPartnerClick(originalData)}
        >
            <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                fill={color}
                rx={5}
            />

            {canShowText && (
                <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 - (canShowStats && statDisplay ? 8 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={fontSize}
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                    {truncateName(name, maxChars)}
                </text>
            )}

            {/* Show stat based on selected metric */}
            {canShowStats && statDisplay && (
                <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize={10}
                    fontWeight="500"
                    fontFamily="Inter, system-ui, sans-serif"
                >
                    {statDisplay}
                </text>
            )}
        </motion.g>
    )
}

function TreeMapChart({ partners, areaMetric, onPartnerClick }) {
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
                <p>Filtrelere uygun partner bulunamadı.</p>
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
                            <span>Konum</span>
                            <span>{tooltipData.displayCity || 'Türkiye'}</span>
                        </div>
                        <div className="tooltip-row">
                            <span>Ort. Kullanıcı</span>
                            <span>{tooltipData.average_users > 0 ? tooltipData.average_users : '-'}</span>
                        </div>
                        {tooltipData.references > 0 && (
                            <div className="tooltip-row">
                                <span>Referans</span>
                                <span>{tooltipData.references}</span>
                            </div>
                        )}
                        {tooltipData.experts > 0 && (
                            <div className="tooltip-row">
                                <span>Sertifikalı Uzman</span>
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
