import type { Log } from 'generated/prisma/browser'

export function renderLogContent(
  content: Log['content'],
  parseToString = true,
) {
  const { value } = content as { value: any }

  return value ? (parseToString ? JSON.stringify(value) : value) : undefined
}
