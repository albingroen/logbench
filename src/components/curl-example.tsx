import { useQuery } from '@tanstack/react-query'
import { codeToHtml } from 'shiki'
import axios from 'axios'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import type { Project } from 'generated/prisma/browser'
import { copyToClipboard } from '@/lib/clipboard'

type CurlExampleProps = {
  projectId: Project['id']
}

export function CurlExample({ projectId }: CurlExampleProps) {
  // Server state
  const { data: ip } = useQuery({
    queryKey: ['ip'],
    queryFn: () => axios.get<string>('/api/ip').then((res) => res.data),
  })

  // Helpers
  const curlCommand = useMemo(
    () =>
      ip
        ? `curl -X POST \\
  'http://${ip}:${window.location.port}/api/projects/${projectId}/logs/ingest' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": { "message": "ok" },
    "level": "INFO"
  }'`
        : null,
    [ip, projectId],
  )

  const { data: curlExample } = useQuery({
    queryKey: ['projects', projectId, 'examples', 'curl', curlCommand],
    queryFn: async () => {
      if (!curlCommand) {
        return
      }

      const html = await codeToHtml(curlCommand, {
        lang: 'shell',
        theme: 'vitesse-dark',
      })

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
