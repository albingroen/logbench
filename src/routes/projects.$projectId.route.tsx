import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RiArrowRightLine, RiBox1Line } from '@remixicon/react'
import Mark from 'mark.js'
import type { Log, SourceFile } from 'generated/prisma/browser'
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
  const [selectedSourceFile, setSelectedSourceFile] =
    useState<SourceFile | null>(null)

  const deferredSearch = useDeferredValue(search)

  // Refs
  const markRef = useRef<Mark | null>(null)

  // Server state
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectFn({ data: { projectId } }),
  })

  const logsQueryKey = ['projects', projectId, 'logs']

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
            {
              ...msg.log,
              createdAt: new Date(msg.log.createdAt),
              updatedAt: new Date(msg.log.updatedAt),
            },
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

  useEffect(() => {
    if (!markRef.current) markRef.current = new Mark('.logs')
    if (deferredSearch) {
      markRef.current.unmark()
      markRef.current.mark(deferredSearch)
    }
  }, [deferredSearch, logs?.length])

  // Helpers
  const sourceFiles = useMemo(() => {
    const seen = new Set<string>()
    return (logs ?? []).flatMap((log) => {
      const sf = log.source?.sourceFile
      if (!sf || seen.has(sf.id)) return []
      seen.add(sf.id)
      return [sf]
    })
  }, [logs])

  const logContentStrings = useMemo(
    () =>
      new Map(
        logs?.map((log) => [
          log.id,
          JSON.stringify(log.content).toLowerCase(),
        ]) ?? [],
      ),
    [logs],
  )

  const filteredLogs = useMemo(() => {
    const lcSearch = deferredSearch.toLowerCase()

    return (
      logs?.filter((log) => {
        const matchesSearch = deferredSearch
          ? log.id.toLowerCase().includes(lcSearch) ||
            log.projectId?.toLowerCase().includes(lcSearch) ||
            log.level.toLowerCase().includes(lcSearch) ||
            log.createdAt.toISOString().includes(lcSearch) ||
            log.updatedAt.toISOString().includes(lcSearch) ||
            logContentStrings.get(log.id)?.includes(lcSearch)
          : true

        const matchesSourceFile = selectedSourceFile
          ? log.source?.sourceFile.id === selectedSourceFile.id
          : true

        return matchesSearch && matchesSourceFile
      }) ?? []
    )
  }, [logs, deferredSearch, selectedSourceFile])

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
        logs={filteredLogs}
        onChangeSearch={setSearch}
        onClearSearch={() => {
          markRef.current?.unmark()
        }}
        sourceFiles={sourceFiles}
        selectedSourceFile={selectedSourceFile}
        onChangeSourceFile={setSelectedSourceFile}
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
