import { useQuery } from '@tanstack/react-query'
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

  if (!curlCommand) {
    return null
  }

  return (
    <div className="p-6 flex-1 flex justify-center items-center flex-col gap-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-medium">Let's send your first log</p>
          <p className="text-base text-muted-foreground">
            To start ingesting logs, you can start by using the cURL command
            below.
          </p>
        </div>
        <pre className="relative rounded bg-muted/30 border p-3 font-mono text-sm font-medium max-w-fit break-all whitespace-pre-wrap">
          <code>{curlCommand}</code>
        </pre>
        <Button
          className="self-end"
          size="lg"
          type="button"
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
    </div>
  )
}
