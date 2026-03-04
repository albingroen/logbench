export function copyToClipboard(value: string): Promise<any> {
  try {
    return navigator.clipboard.writeText(value)
  } catch {
    return new Promise((res) => {
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      res(undefined)
    })
  }
}
