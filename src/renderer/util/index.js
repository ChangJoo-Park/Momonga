const getCaretPosition = () => {
  const el = document.activeElement
  if (el.nodeName === 'BODY') {
    return
  }
  const val = el.value
  return val.slice(0, el.selectionStart).length
}

const setCurrentlocale = (locale = 'en') => {
  window.localStorage.setItem('locale', locale)
}
const getCurrentLocale = () => {
  if (!window.localStorage.getItem('locale')) {
    setCurrentlocale()
  }
  const locale = window.localStorage.getItem('locale')
  return locale
}

const getCurrentLocaleFile = () => {
  const locale = getCurrentLocale()
  let localeFile

  switch (locale) {
    case 'en':
      localeFile = require('date-fns/locale/en')
      break
    case 'ko':
      localeFile = require('date-fns/locale/ko')
      break
    case 'es':
      localeFile = require('date-fns/locale/es')
      break
    case 'ja':
      localeFile = require('date-fns/locale/ja')
      break
    case 'zh_cn':
      localeFile = require('date-fns/locale/zh_cn')
      break
    default:
      localeFile = require('date-fns/locale/en')
      break
  }
  return localeFile
}
export default {
  getCaretPosition,
  setCurrentlocale,
  getCurrentLocale,
  getCurrentLocaleFile
}
