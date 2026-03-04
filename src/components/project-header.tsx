import { RiClipboardLine, RiMoreLine, RiSearchLine } from '@remixicon/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import Mark from 'mark.js'
import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  InputGroupInput,
  InputGroupText,
} from './ui/input-group'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import type { Project } from 'generated/prisma/browser'
import { Route } from '@/routes/projects.$projectId.route'
import { copyToClipboard } from '@/lib/clipboard'

export function ProjectHeader() {
  // Helpers
  const mark = useMemo(() => new Mark('.logs'), [])

  // Router state
  const { projectId } = Route.useParams()

  // Server state
  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () =>
      axios.get<Project>(`/api/projects/${projectId}`).then((res) => res.data),
  })

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useHotkey('Mod+F', (e) => {
    e.preventDefault()
    e.stopPropagation()

    searchInputRef.current?.focus()
  })

  // Local state
  const [matchCount, setMatchCount] = useState<number>()

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
              <BreadcrumbPage>{project?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex-1 flex gap-2.5">
        <InputGroup className="flex-1">
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search logs..."
            onChange={(e) => {
              mark.unmark()
              mark.mark(e.currentTarget.value, {
                done: (newMatchCount) => {
                  if (e.currentTarget.value) {
                    setMatchCount(newMatchCount)
                  } else {
                    setMatchCount(undefined)
                  }
                },
              })
            }}
          />
          {typeof matchCount === 'number' && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                {matchCount.toLocaleString()} result(s)
              </InputGroupText>
            </InputGroupAddon>
          )}
          <InputGroupAddon align="inline-end">
            <RiSearchLine />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <RiMoreLine />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-48" align="end">
            <DropdownMenuItem
              onSelect={() => {
                toast.promise(
                  axios.get('/api/ip').then((res) => {
                    const url = `http://${res.data}:${window.location.port}/api/projects/${projectId}/logs/ingest`

                    return copyToClipboard(url)
                  }),
                  {
                    loading: 'Loading...',
                    success: `POST URL copied to clipboard`,
                    error: 'Failed to copy POST URL to clipboard',
                  },
                )
              }}
            >
              <RiClipboardLine />
              Copy POST URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
