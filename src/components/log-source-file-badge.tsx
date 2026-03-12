import { Badge } from './ui/badge'
import { FileIcon } from './file-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import type { SourceFile } from 'generated/prisma/browser'
import { getSourceFileDetails } from '@/lib/log'

type LogSourceFileBadgeProps = {
  sourceFile: SourceFile
}

export function LogSourceFileBadge({ sourceFile }: LogSourceFileBadgeProps) {
  const { baseName, dirName, extension } = getSourceFileDetails(sourceFile)

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="secondary" className="gap-0">
          <FileIcon
            extension={extension}
            className="size-3.5 text-dim-foreground mr-0.5"
          />
          <span
            className="text-muted-foreground max-w-36 truncate"
            style={{ direction: 'rtl' }}
          >
            {dirName}
          </span>
          <span>{baseName}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{sourceFile.fileName}</TooltipContent>
    </Tooltip>
  )
}
