import { TreeView, VisualJson } from '@visual-json/react'
import { LogLevel } from 'generated/prisma/browser'
import type { Log } from 'generated/prisma/browser'
import type { JsonObject } from '@visual-json/core'
import { renderLogContent } from '@/lib/log'
import { cn, isObject } from '@/lib/utils'

type LogContentProps = {
  content: Log['content']
  level: Log['level']
}

export function LogContentInline({
  content: rawContent,
  level,
}: LogContentProps) {
  const content = renderLogContent(rawContent)

  return (
    <span
      className={cn(
        'line-clamp-10',
        {
          [LogLevel.ERROR]: 'text-destructive',
          [LogLevel.WARNING]: 'text-warning',
          [LogLevel.INFO]: 'text-foreground',
        }[level],
      )}
    >
      {content}
    </span>
  )
}

export function LogContentBlock({ content: rawContent }: LogContentProps) {
  const content = renderLogContent(rawContent, false)

  if (isObject(content)) {
    return (
      <VisualJson value={content as JsonObject}>
        <TreeView showCounts showValues className="bg-muted/50!" />
      </VisualJson>
    )
  }

  return (
    <pre className="bg-muted/50 py-4 px-6 text-sm/relaxed text-balance break-all">
      {typeof content === 'string' ? content : JSON.stringify(content)}
    </pre>
  )
}
