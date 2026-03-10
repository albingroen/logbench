import { RiClipboardLine, RiFile2Fill, RiMore2Line } from '@remixicon/react'
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

type LogSourceWithSourceFile = TLogSource & { sourceFile?: SourceFile }

type LogSourceProps = {
  source: LogSourceWithSourceFile
}

export function LogSource({
  source: { sourceFile, lineNumber, columnNumber },
}: LogSourceProps) {
  const lineCol = [lineNumber, columnNumber].filter((v) => v != null).join(':')
  const baseName = sourceFile?.fileName.split('/').at(-1)
  const dirName = sourceFile?.fileName.split('/').slice(0, -1).join('/')

  return (
    <Card className="mt-4 p-0 gap-0">
      <CardHeader className="bg-muted py-1.5">
        <p className="text-xs text-muted-foreground">Location</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3.5">
        <div className="flex items-start gap-1.5">
          <RiFile2Fill className="size-3.5 text-dim-foreground" />
          <div className="flex items-end gap-2 flex-1">
            <div className="flex flex-col gap-2 flex-1">
              <p className="text-sm font-mono leading-none">
                {baseName}:{lineCol}
              </p>
              <p className="text-xs text-dim-foreground leading-none">
                {dirName}
              </p>
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
        </div>
      </CardContent>
    </Card>
  )
}
