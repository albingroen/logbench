import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { RiArrowRightLine, RiBox1Line } from '@remixicon/react'
import type { Log, Project } from 'generated/prisma/browser'
import { ProjectHeader } from '@/components/project-header'
import { Logs } from '@/components/logs'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { CodeExamples } from '@/components/code-examples'

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  // Router state
  const { projectId } = Route.useParams()

  // Server state
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () =>
      axios.get<Project>(`/api/projects/${projectId}`).then((res) => res.data),
  })

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

  if (isProjectLoading) {
    return null
  }

  if (!project) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiBox1Line />
          </EmptyMedia>
          <EmptyTitle>Project not found</EmptyTitle>
          <EmptyDescription>
            This project does not seem to exist unfortunately.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild>
            <Link to="/projects/new">
              Create Project
              <RiArrowRightLine />
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <ProjectHeader project={project} />

      {logs?.length ? (
        <Logs data={logs} />
      ) : (
        !isLogsLoading && <CodeExamples projectId={projectId} />
      )}

      <Outlet />
    </>
  )
}
