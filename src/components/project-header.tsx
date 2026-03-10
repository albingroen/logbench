import {
  RiCloseLine,
  RiFileCopyLine,
  RiForbidLine,
  RiMoreLine,
  RiSearchLine,
} from '@remixicon/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from './ui/breadcrumb'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import { ProjectDropdown } from './project-dropdown'
import { Badge } from './ui/badge'
import type { Log, Project } from 'generated/prisma/browser'
import { deleteLogs as deleteLogsFn } from '@/lib/server/logs'
import { copyWithToast } from '@/lib/clipboard'
import { renderLogContent } from '@/lib/log'

type ProjectHeaderProps = {
  logs: Array<Log>
  onChangeSearch: (value: string) => void
  onClearSearch: () => void
  filteredLogsCount: number
  project: Project
  search: string
}

export function ProjectHeader({
  filteredLogsCount,
  logs,
  onChangeSearch,
  onClearSearch,
  project,
  search,
}: ProjectHeaderProps) {
  // Server state
  const queryClient = useQueryClient()

  const { mutate: deleteLogs } = useMutation({
    mutationFn: () => deleteLogsFn({ data: { projectId: project.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', project.id, 'logs'],
      })
    },
    onError: () => {
      toast.error('Failed to clear logs')
    },
  })

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Helpers
  function focusSearchInput() {
    searchInputRef.current?.focus()
  }

  function copyLogs() {
    const values = logs.map((log) => renderLogContent(log.content, false))
    copyWithToast(JSON.stringify(values, null, 2), 'Logs')
  }

  // Keyboard shortcuts
  useHotkey('Mod+F', (e) => {
    e.preventDefault()
    e.stopPropagation()
    focusSearchInput()
  })

  return (
    <header className="flex h-12 shrink-0 items-center gap-6 border-b px-4 sticky top-0 bg-background z-10">
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{project.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex-1 flex gap-2.5">
        <InputGroup className="flex-1">
          <InputGroupInput
            value={search}
            ref={searchInputRef}
            placeholder="Search logs…"
            onChange={(e) => {
              const newValue = e.currentTarget.value
              onChangeSearch(newValue)

              if (!newValue) {
                onClearSearch()
              }
            }}
          />
          {search && typeof filteredLogsCount === 'number' && (
            <InputGroupAddon align="inline-end">
              <Badge variant="secondary">
                {filteredLogsCount.toLocaleString()} log(s)
              </Badge>
            </InputGroupAddon>
          )}
          {search && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear"
                onClick={() => {
                  onChangeSearch('')
                  focusSearchInput()
                  onClearSearch()
                }}
              >
                <RiCloseLine />
              </InputGroupButton>
            </InputGroupAddon>
          )}
          <InputGroupAddon align="inline-end">
            <RiSearchLine />
          </InputGroupAddon>
        </InputGroup>

        <Button
          onClick={() => {
            deleteLogs()
          }}
          type="button"
          variant="outline"
        >
          <RiForbidLine />
          Clear logs
        </Button>

        <Button
          onClick={() => {
            copyLogs()
          }}
          type="button"
          variant="outline"
        >
          <RiFileCopyLine />
          Copy logs
        </Button>

        <ProjectDropdown align="end" project={project}>
          <Button size="icon" variant="ghost" aria-label="Project menu">
            <RiMoreLine />
          </Button>
        </ProjectDropdown>
      </div>
    </header>
  )
}
