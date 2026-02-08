import { useMemo, useState, useRef, useEffect } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

// Distinct color palette for each level
const COLORS = {
    Gold: { h: 28, s: 80, l: 52 },    // Orange
    Silver: { h: 204, s: 70, l: 53 }, // Blue  
    Ready: { h: 145, s: 63, l: 42 }   // Green
}

// Get shade based on metric value (higher = darker)
const getColorWithShade = (level, value, maxValue) => {
    const base = COLORS[level] || COLORS.Ready
    const ratio = Math.min(value / Math.max(maxValue, 1), 1)
    const lightness = base.l + (1 - ratio) * 12
    return `hsl(${base.h}, ${base.s}%, ${lightness}%)`
}

// Custom content - ALL boxes show name
const CustomizedContent = (props) => {
    const { x, y, width, height, name, level, references, districtValue, index, depth, maxMetric, areaMetric } = props

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
        if (areaMetric === 'district') {
            return districtValue > 0 ? `%${districtValue}` : null
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

function TreeMapChart({ partners, areaMetric }) {
    const [tooltipData, setTooltipData] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)

    // Calculate max for sizing
    const maxMetric = useMemo(() => {
        return Math.max(...partners.map(p => p.references), 1)
    }, [partners])

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
                if (areaMetric === 'district') {
                    sizeValue = Math.max(p.districtValue, 1)
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
                    maxMetric
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
                    content={<CustomizedContent maxMetric={maxMetric} areaMetric={areaMetric} />}
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
