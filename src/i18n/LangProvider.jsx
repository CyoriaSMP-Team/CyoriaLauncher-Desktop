import { useState, useEffect, createContext, useContext } from 'react'
import { loadAppSettings, saveAppSettings } from '../utils/appSettings'

export const LangContext = createContext(null)

// Bundled localizations also work in packaged file:// Electron builds.
import thai from './locales/th.json'
import english from './locales/en.json'
import vietnamese from './locales/vi.json'
const cache = {th: thai, en: english, vi: vietnamese}
const availableLanguages = [
  {code:'en', name:'English', flag:'🇬🇧'},
  {code:'th', name:'ภาษาไทย', flag:'🇹🇭'},
  {code:'vi', name:'Tiếng Việt', flag:'🇻🇳'},
]
async function fetchLang(code) { return cache[code] || cache.en }
async function fetchLangList() { return availableLanguages }

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => acc?.[k], obj)
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en')
  const [translations, setTranslations] = useState({})
  const [langs, setLangs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLangList().then(setLangs)
    loadAppSettings().then(s => {
      const code = s?.language || 'en'
      setLangState(code)
      document.documentElement.lang = code
      Promise.all([fetchLang('en'), fetchLang(code)]).then(([, data]) => { if (data) setTranslations(data) })
    })
  }, [])

  async function setLang(code) {
    setLoading(true)
    const data = await fetchLang(code)
    if (data) {
      setTranslations(data)
      setLangState(code)
      document.documentElement.lang = code
      const currentSettings = await loadAppSettings()
      await saveAppSettings({ ...currentSettings, language: code })
      window.dispatchEvent(new CustomEvent('vxc-lang-change', { detail: code }))
    }
    setLoading(false)
  }

  function t(key, vars = {}) {
    let str = getNestedValue(translations, key) ?? getNestedValue(cache.en, key) ?? key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), v)
    })
    return str
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, langs, loading, translations }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
