export const PARTNER_LEVELS = ['Gold', 'Silver', 'Ready', 'Learning']

export const LEVEL_ORDER = Object.freeze(
  PARTNER_LEVELS.reduce((accumulator, level, index) => {
    accumulator[level] = index
    return accumulator
  }, {})
)

export const getLevelLabel = (level, t) => t(`levels.${level}`, { defaultValue: level })
