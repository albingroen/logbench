import {
  RiCloseLine,
  RiForbidLine,
  RiMoreLine,
  RiSearchLine,
} from '@remixicon/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
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

type ProjectHeaderProps = {
  onChangeSearch: (value: string) => void
  onClearSearch: () => void
  filteredLogsCount: number
  project: Project
  search: string
}

export function ProjectHeader({
  filteredLogsCount,
  onChangeSearch,
  onClearSearch,
  project,
  search,
}: ProjectHeaderProps) {
  // Server state
  const queryClient = useQueryClient()

  const { mutate: deleteLogs } = useMutation({
    mutationFn: () =>
      axios
        .delete<Array<Log>>(`/api/projects/${project.id}/logs`)
        .then((res) => res.data),
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
            placeholder="Search logs..."
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

        <ProjectDropdown project={project}>
          <Button size="icon" variant="ghost">
            <RiMoreLine />
          </Button>
        </ProjectDropdown>
      </div>
    </header>
  )
}
