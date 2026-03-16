import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import type { Project } from 'generated/prisma/browser'
import { copyWithToast } from '@/lib/clipboard'
import { highlightCode } from '@/lib/shiki'

type CurlExampleProps = {
  projectId: Project['id']
}

export function CurlExample({ projectId }: CurlExampleProps) {
  const { systemTheme } = useTheme()

  // Helpers
  const curlCommand = useMemo(
    () =>
      `curl -X POST \\
  '${window.location.origin}/api/projects/${projectId}/logs/ingest' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": { "message": "ok" },
    "level": "INFO",
    "isBookmarked": true,
    "annotation": "my note"
  }'`,
    [projectId],
  )

  const { data: curlExample } = useQuery({
    queryKey: [
      'projects',
      projectId,
      'examples',
      'curl',
      curlCommand,
      systemTheme,
    ],
    queryFn: async () => {
      if (!curlCommand) {
        return
      }

      const html = await highlightCode(curlCommand, 'shell', systemTheme)

      return html
    },
    enabled: !!curlCommand,
  })

  if (!curlCommand || !curlExample) {
    return null
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="code-example"
        dangerouslySetInnerHTML={{ __html: curlExample }}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => copyWithToast(curlCommand, 'Command')}
      >
        Copy command
      </Button>
    </div>
  )
}
