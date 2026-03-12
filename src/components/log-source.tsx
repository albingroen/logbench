import { RiClipboardLine, RiMore2Line } from '@remixicon/react'
import { LogSourceFile } from './log-source-file'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import type {
  SourceFile,
  LogSource as TLogSource,
} from 'generated/prisma/browser'
import { launchEditor } from '@/lib/server/editor'
import { copyWithToast } from '@/lib/clipboard'
import { getSourceFileDetails } from '@/lib/log'

type LogSourceWithSourceFile = TLogSource & { sourceFile?: SourceFile }

type LogSourceProps = {
  source: LogSourceWithSourceFile
}

export function LogSource({
  source: { sourceFile, lineNumber, columnNumber },
}: LogSourceProps) {
  const lineCol = [lineNumber, columnNumber].filter((v) => v != null).join(':')
  const { baseName } = sourceFile
    ? getSourceFileDetails(sourceFile)
    : { baseName: undefined }

  return (
    <Card className="mt-4 p-0 gap-0">
      <CardHeader className="bg-muted py-1.5">
        <p className="text-xs text-muted-foreground">Location</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3.5">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            {sourceFile && (
              <LogSourceFile sourceFile={sourceFile} lineCol={lineCol} />
            )}
          </div>
          <ButtonGroup>
            <Button
              variant="secondary"
              className="gap-1.5"
              size="sm"
              onClick={() => {
                if (!sourceFile) {
                  return
                }

                launchEditor({
                  data: {
                    fileName: `${sourceFile.fileName}:${lineCol}`,
                  },
                })
              }}
            >
              Open in editor
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="secondary">
                  <RiMore2Line />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sourceFile?.fileName && (
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        copyWithToast(`${baseName}:${lineCol}`, 'Location')
                      }}
                    >
                      <RiClipboardLine />
                      Copy location
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onSelect={() => {
                        copyWithToast(
                          `${sourceFile.fileName}:${lineCol}`,
                          'Full location',
                        )
                      }}
                    >
                      <RiClipboardLine />
                      Copy full location
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </CardContent>
    </Card>
  )
}
