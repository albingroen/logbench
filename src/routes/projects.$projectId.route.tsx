import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import type { Log } from 'generated/prisma/browser'
import { ProjectHeader } from '@/components/project-header'
import { Logs } from '@/components/logs'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/clipboard'

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  // Router state
  const { projectId } = Route.useParams()

  // Server state
  const logsQueryKey = useMemo(
    () => ['projects', projectId, 'logs'],
    [projectId],
  )

  const queryClient = useQueryClient()

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: logsQueryKey,
    queryFn: () =>
      axios
        .get<Array<Log>>(`/api/projects/${projectId}/logs`)
        .then((res) => res.data),
  })

  // Side-effects
  useEffect(() => {
    const url = new URL(
      `/api/projects/${projectId}/logs/ingest`,
      window.location.origin,
    )
    url.searchParams.set('stream', '1')
    const eventSource = new EventSource(url.toString())

    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as { type: string; log?: Log }
        if (msg.type === 'log.created' && msg.log) {
          // setNewLogsCount((n) => n + 1)
          // When logs are loaded via React Query: queryClient.invalidateQueries({ queryKey: ['logs', projectId] })

          const queryData = queryClient.getQueryData<Array<Log>>(logsQueryKey)
          queryClient.setQueryData(logsQueryKey, [
            msg.log,
            ...(queryData || []),
          ])
        }
      } catch {
        // ignore non-JSON or comment events
      }
    }

    eventSource.onerror = () => {
      // Browser auto-reconnects EventSource by default
    }

    return () => eventSource.close()
  }, [projectId])

  // Helpers
  const curlCommand = useCallback(
    (origin: string = window.location.origin) => `curl -X POST \\
  '${origin}/api/projects/cmmbpc9oz00009trp1ei5es20/logs/ingest' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "content": { "message": "ok" },
    "level": "INFO"
  }'`,
    [],
  )

  return (
    <>
      <ProjectHeader />

      {logs?.length ? (
        <Logs data={logs} />
      ) : (
        !isLogsLoading && (
          <div className="p-6 flex-1 flex justify-center items-center flex-col gap-4">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xl font-medium">Let's send your first log</p>
                <p className="text-base text-muted-foreground">
                  To start ingesting logs, you can start by using the cURL
                  command below.
                </p>
              </div>
              <pre className="relative rounded bg-muted/30 border p-3 font-mono text-sm font-semibold max-w-fit break-all whitespace-pre-wrap">
                <code>{curlCommand()}</code>
              </pre>
              <Button
                className="self-end"
                size="lg"
                type="button"
                onClick={() => {
                  toast.promise(
                    axios.get('/api/ip').then((res) => {
                      return copyToClipboard(
                        curlCommand(
                          `http://${res.data}:${window.location.port}`,
                        ),
                      )
                    }),
                    {
                      loading: 'Loading...',
                      success: `Command copied to clipboard`,
                      error: 'Failed to copy command to clipboard',
                    },
                  )
                }}
              >
                Copy command
              </Button>
            </div>
          </div>
        )
      )}

      <Outlet />
    </>
  )
}
