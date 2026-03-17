import { toast } from 'sonner'

function copyToClipboard(value: string): Promise<any> {
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

export function copyWithToast(value: string, label = 'Content') {
  toast.promise(copyToClipboard(value), {
    loading: 'Loading\u2026',
    success: `${label} copied to clipboard`,
    error: `Failed to copy ${label.toLowerCase()} to clipboard`,
  })
}
