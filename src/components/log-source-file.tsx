import { FileIcon } from './file-icon'
import type { SourceFile } from 'generated/prisma/browser'
import { getSourceFileDetails } from '@/lib/log'

type LogSourceFileProps = {
  sourceFile: SourceFile
  lineCol?: string
}

export function LogSourceFile({ sourceFile, lineCol }: LogSourceFileProps) {
  const { baseName, dirName, extension } = getSourceFileDetails(sourceFile)

  return (
    <div className="flex items-start gap-1.5">
      <FileIcon
        extension={extension}
        className="size-3.5 text-dim-foreground"
      />
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-sm leading-none">
          {baseName}
          {lineCol ? `:${lineCol}` : ''}
        </span>
        {dirName && (
          <span className="text-xs text-dim-foreground leading-none">
            {dirName}
          </span>
        )}
      </div>
    </div>
  )
}
