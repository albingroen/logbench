import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import type { Project } from 'generated/prisma/browser'
import { copyToClipboard } from '@/lib/clipboard'
import { highlightCode } from '@/lib/shiki'

type CurlExampleProps = {
  projectId: Project['id']
}

export function CurlExample({ projectId }: CurlExampleProps) {
  // Helpers
  const curlCommand = useMemo(
    () =>
      `curl -X POST \\
  '${window.location.origin}/api/projects/${projectId}/logs/ingest' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": { "message": "ok" },
    "level": "INFO"
  }'`,
    [projectId],
  )

  const { data: curlExample } = useQuery({
    queryKey: ['projects', projectId, 'examples', 'curl', curlCommand],
    queryFn: async () => {
      if (!curlCommand) {
        return
      }

      const html = highlightCode(curlCommand, 'shell')

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
        onClick={() => {
          toast.promise(copyToClipboard(curlCommand), {
            loading: 'Loading...',
            success: `Command copied to clipboard`,
            error: 'Failed to copy command to clipboard',
          })
        }}
      >
        Copy command
      </Button>
    </div>
  )
}
