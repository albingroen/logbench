export function generateZedDeeplink(content: string): string {
  const baseUrl = 'zed://agent'
  const url = new URL(baseUrl)
  url.searchParams.set('prompt', content)
  return url.toString()
}
