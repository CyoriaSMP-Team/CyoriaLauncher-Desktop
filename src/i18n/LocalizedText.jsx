import { useLang } from './LangProvider'

/** Renders a locale entry and automatically refreshes when the language changes. */
export default function LocalizedText({ id }) {
  const { t } = useLang()
  return t(id)
}
