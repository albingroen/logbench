import * as z from 'zod'
import { isObject } from './utils'
import type { Log } from 'generated/prisma/browser'

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

export const logSchema = z.object({
  annotation: z.string().nullable(),
  isBookmarked: z.boolean().default(false),
})
