import type { Log } from 'generated/prisma/browser'
import { isObject } from './utils'

export function renderLogContent(
  content: Log['content'],
  parseToString = true,
) {
  const { value } = content as { value: any }

  return typeof value === 'undefined'
    ? 'undefined'
    : parseToString
      ? isObject(value)
        ? JSON.stringify(value)
        : value
      : value
}
