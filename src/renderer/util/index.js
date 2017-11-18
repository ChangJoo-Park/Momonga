const getCaretPosition = () => {
  const el = document.activeElement
  if (el.nodeName === 'BODY') {
    return
  }
  const val = el.value
  return val.slice(0, el.selectionStart).length
}

const setCurrentlocale = (locale = 'en') => {
  const Cookies = require('js-cookie')
  Cookies.set('locale', locale)
}
const getCurrentLocale = () => {
  const Cookies = require('js-cookie')
  if (!Cookies.get('locale')) {
    console.log('쿠키가 없음')
    setCurrentlocale()
  }
  const locale = Cookies.get('locale')
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
    default:
      localeFile = require('date-fns/locale/en')
      break
  }
  return localeFile
}
export default {
  getCaretPosition,
  setCurrentlocale,
  getCurrentLocale
}
