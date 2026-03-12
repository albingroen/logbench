import * as z from 'zod'
import { isObject } from './utils'
import type { Log, SourceFile } from 'generated/prisma/browser'

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

export function generateMarkdownLogContent(content: unknown) {
  return `\`\`\`
${JSON.stringify(content, null, 2)}
\`\`\``
}

export function getSourceFileDetails(sourceFile: SourceFile) {
  const parts = sourceFile.fileName.split('/')
  const baseName = parts.at(-1)
  const dirName = parts.slice(0, -1).join('/')
  const extension = baseName?.split('.').at(-1)

  return {
    dirName,
    extension,
    baseName,
  }
}
