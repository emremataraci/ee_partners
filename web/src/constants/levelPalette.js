export const LEVEL_PALETTE = {
  Gold: { bg: '#FFD21F', text: '#5A4300' },
  Silver: { bg: '#C0C0C0', text: '#3F3F46' },
  Ready: { bg: '#A0ECEF', text: '#0F4F56' },
  Learning: { bg: '#BFA8E8', text: '#4D3D73' },
}

export const getLevelPalette = (level) => LEVEL_PALETTE[level] || LEVEL_PALETTE.Ready
