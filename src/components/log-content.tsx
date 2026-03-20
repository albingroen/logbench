import { TreeView, VisualJson } from '@visual-json/react'
import { LogLevel } from 'generated/prisma/browser'
import { memo, useMemo, useState } from 'react'
import {
  RiArrowDownSLine,
  RiClipboardLine,
  RiCursorAiFill,
  RiMarkdownFill,
  RiOpenaiFill,
} from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { Switch } from './ui/switch'
import { Field, FieldLabel } from './ui/field'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import type { Log } from 'generated/prisma/browser'
import type { JsonObject } from '@visual-json/core'
import { generateMarkdownLogContent, renderLogContent } from '@/lib/log'
import { cn, isObject } from '@/lib/utils'
import { copyWithToast } from '@/lib/clipboard'
import { highlightCode } from '@/lib/shiki'
import { generateCursorDeeplink } from '@/lib/cursor'
import { generateZedDeeplink } from '@/lib/zed'
import { generateCodexDeeplink } from '@/lib/codex'
import { ZedIcon } from '@/components/icons'

const ideIntegrations = [
  {
    label: 'Add to chat in Cursor',
    icon: <RiCursorAiFill />,
    generateDeeplink: generateCursorDeeplink,
  },
  {
    label: 'Add to chat in Zed',
    icon: <ZedIcon />,
    generateDeeplink: generateZedDeeplink,
  },
  {
    label: 'Add to chat in Codex',
    icon: <RiOpenaiFill />,
    generateDeeplink: generateCodexDeeplink,
  },
]

type LogContentInlineProps = {
  content: Log['content']
  level: Log['level']
}

type LogContentBlockProps = LogContentInlineProps & {
  logId: Log['id']
  meta?: { fileName?: string; lineNumber?: number; date?: string }
}

export const LogContentInline = memo(function LogContentInline({
  content: rawContent,
  level,
}: LogContentInlineProps) {
  const content = renderLogContent(rawContent)

  return (
    <span
      className={cn(
        'line-clamp-10',
        {
          [LogLevel.ERROR]: 'text-destructive',
          [LogLevel.WARNING]: 'text-warning',
          [LogLevel.INFO]: 'text-foreground',
          [LogLevel.LOG]: 'text-muted-foreground',
        }[level],
      )}
    >
      {content}
    </span>
  )
})

export function LogContentBlock({
  logId,
  content: rawContent,
  meta,
}: LogContentBlockProps) {
  const { systemTheme } = useTheme()

  // Helpers
  const content = renderLogContent(rawContent, false)
  const isContentObject = isObject(content)
  const stringifiedContent = useMemo(
    () =>
      isContentObject ? JSON.stringify(content, null, 2) : String(content),
    [content, isContentObject],
  )

  // Local state
  const [isRaw, setIsRaw] = useState<boolean>(!isContentObject)

  // Highlight state
  const { data: highlightedContent, isLoading: isHighlightedCodeLoading } =
    useQuery({
      queryKey: [logId, 'raw'],
      queryFn: () => highlightCode(stringifiedContent, 'json', systemTheme),
      enabled: isContentObject,
    })

  return (
    <div className="flex flex-col gap-3 pt-4 h-full">
      <div className="flex items-center justify-between px-4">
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => copyWithToast(stringifiedContent)}
          >
            <RiClipboardLine />
            Copy content
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="outline">
                <RiArrowDownSLine />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-48">
              <DropdownMenuItem
                onSelect={() =>
                  copyWithToast(generateMarkdownLogContent(content, meta))
                }
              >
                <RiMarkdownFill />
                Copy as Markdown
              </DropdownMenuItem>
              {ideIntegrations.map(({ label, icon, generateDeeplink }) => (
                <DropdownMenuItem
                  key={label}
                  onSelect={() => {
                    window.location.href = generateDeeplink(
                      generateMarkdownLogContent(content, meta),
                    )
                  }}
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>

        {isContentObject && (
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel>Raw</FieldLabel>

            <Switch checked={isRaw} onCheckedChange={setIsRaw} />
          </Field>
        )}
      </div>

      <div
        id="log-content"
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {isRaw ? (
          highlightedContent ? (
            <div
              className="code-example"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          ) : isHighlightedCodeLoading ? null : (
            <pre className="bg-muted/50 py-4 px-6 text-xs/relaxed text-balance break-all">
              {stringifiedContent}
            </pre>
          )
        ) : (
          <VisualJson value={content as JsonObject}>
            <TreeView showCounts showValues className="bg-muted/50!" />
          </VisualJson>
        )}
      </div>
    </div>
  )
}
