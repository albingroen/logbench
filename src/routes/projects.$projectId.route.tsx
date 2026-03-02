import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { Log } from 'generated/prisma/browser'
import { ProjectHeader } from '@/components/project-header'
import { Logs } from '@/components/logs'

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

  const { data: logs } = useQuery({
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

  return (
    <>
      <ProjectHeader />

      <Logs data={logs ?? []} />

      <Outlet />
    </>
  )
}
