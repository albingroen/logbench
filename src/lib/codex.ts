export function generateCodexDeeplink(content: string): string {
  const baseUrl = 'codex://new'
  const url = new URL(baseUrl)
  url.searchParams.set('prompt', content)
  return url.toString()
}
