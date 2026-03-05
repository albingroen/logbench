import { TreeView, VisualJson } from '@visual-json/react'
import { LogLevel } from 'generated/prisma/browser'
import { useState } from 'react'
import { RiClipboardLine } from '@remixicon/react'
import { toast } from 'sonner'
import { Switch } from './ui/switch'
import { Field, FieldLabel } from './ui/field'
import { Button } from './ui/button'
import type { Log } from 'generated/prisma/browser'
import type { JsonObject } from '@visual-json/core'
import { renderLogContent } from '@/lib/log'
import { cn, isObject } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'

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

  const isContentObject = isObject(content)
  const [isRaw, setIsRaw] = useState<boolean>(!isContentObject)

  return (
    <div className="flex flex-col gap-3.5 pt-4">
      <div className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            toast.promise(copyToClipboard(JSON.stringify(content, null, 2)), {
              loading: 'Loading...',
              success: `Content copied to clipboard`,
              error: 'Failed to copy content to clipboard',
            })
          }}
        >
          <RiClipboardLine />
          Copy content
        </Button>

        {isContentObject && (
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel>Raw</FieldLabel>

            <Switch checked={isRaw} onCheckedChange={setIsRaw} />
          </Field>
        )}
      </div>

      {isRaw ? (
        <pre className="bg-muted/50 py-4 px-6 text-sm/relaxed text-balance break-all">
          {typeof content === 'string'
            ? content
            : JSON.stringify(content, null, 2)}
        </pre>
      ) : (
        <VisualJson value={content as JsonObject}>
          <TreeView showCounts showValues className="bg-muted/50!" />
        </VisualJson>
      )}
    </div>
  )
}
