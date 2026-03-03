import { TreeView, VisualJson } from '@visual-json/react'
import type { Log } from 'generated/prisma/browser'
import type { JsonObject } from '@visual-json/core'
import { renderLogContent } from '@/lib/log'
import { isObject } from '@/lib/utils'

type LogContentProps = {
  content: Log['content']
}

export function LogContentInline({ content: rawContent }: LogContentProps) {
  const content = renderLogContent(rawContent)

  if (!content) {
    return <span className="text-muted-foreground">undefined</span>
  }

  return <span className="line-clamp-10">{content}</span>
}

export function LogContentBlock({ content: rawContent }: LogContentProps) {
  const content = renderLogContent(rawContent, false)

  if (isObject(content)) {
    return (
      <div>
        <VisualJson value={content as JsonObject}>
          <TreeView showCounts showValues />
        </VisualJson>
      </div>
    )
  }

  return (
    <pre className="px-6 leading-relaxed text-sm">
      {content ? (
        typeof content === 'string' ? (
          content
        ) : (
          JSON.stringify(content)
        )
      ) : (
        <span className="text-muted-foreground">undefined</span>
      )}
    </pre>
  )
}
