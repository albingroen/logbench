import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RiArrowRightLine, RiBox1Line } from '@remixicon/react'
import Mark from 'mark.js'
import type { Log } from 'generated/prisma/browser'
import { getProject as getProjectFn } from '@/lib/server/projects'
import { getLogs as getLogsFn } from '@/lib/server/logs'
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

  // Local state
  const [search, setSearch] = useState<string>('')

  // Server state
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectFn({ data: { projectId } }),
  })

  const logsQueryKey = useMemo(
    () => ['projects', projectId, 'logs'],
    [projectId],
  )

  const queryClient = useQueryClient()

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: logsQueryKey,
    queryFn: () => getLogsFn({ data: { projectId } }),
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
  const mark = useMemo(() => new Mark('.logs'), [])

  useEffect(() => {
    if (search) {
      mark.unmark()
      mark.mark(search)
    }
  }, [search, logs?.length])

  const filteredLogs = useMemo(() => {
    const lcSearch = search.toLowerCase()

    return (
      logs?.filter((log) => {
        return search
          ? log.id.toLowerCase().includes(lcSearch) ||
              log.projectId?.toLowerCase().includes(lcSearch) ||
              log.level.toLowerCase().includes(lcSearch) ||
              (log.createdAt as unknown as string).includes(lcSearch) ||
              (log.updatedAt as unknown as string).includes(lcSearch) ||
              JSON.stringify(log.content).toLowerCase().includes(lcSearch)
          : true
      }) ?? []
    )
  }, [logs, search])

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
      <ProjectHeader
        search={search}
        project={project}
        onChangeSearch={setSearch}
        filteredLogsCount={filteredLogs.length}
        onClearSearch={() => {
          mark.unmark()
        }}
      />

      {logs?.length ? (
        <Logs data={filteredLogs} />
      ) : (
        !isLogsLoading && <CodeExamples projectId={projectId} />
      )}

      <Outlet />
    </>
  )
}
