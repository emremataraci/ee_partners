import { useTranslation } from 'react-i18next'
import { getPartnerLanguageCodes, getPartnerLanguageMeta, getPartnerLanguageLabel } from '../constants/partnerLanguages'

function LanguageBadges({ languages, className = '' }) {
  const { t } = useTranslation()
  const languageCodes = getPartnerLanguageCodes(languages)

  if (!languageCodes.length) return null

  return (
    <div className={`language-badge-group ${className}`.trim()}>
      {languageCodes.map(code => {
        const meta = getPartnerLanguageMeta(code)

        return (
          <span key={code} className="language-badge-chip">
            <span className="language-badge-flag" aria-hidden="true">{meta?.flag}</span>
            <span>{getPartnerLanguageLabel(code, t)}</span>
          </span>
        )
      })}
    </div>
  )
}

export default LanguageBadges
