const getCaretPosition = () => {
  const el = document.activeElement
  if (el.nodeName === 'BODY') {
    return
  }
  const val = el.value
  return val.slice(0, el.selectionStart).length
}

export default {
  getCaretPosition
}
