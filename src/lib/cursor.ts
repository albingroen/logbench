export function generateCursorDeeplink(content: string): string {
  const baseUrl = 'cursor://anysphere.cursor-deeplink/prompt'
  const url = new URL(baseUrl)
  url.searchParams.set('text', content)
  return url.toString()
}
