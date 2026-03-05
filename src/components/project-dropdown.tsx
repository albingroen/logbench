import { RiClipboardLine, RiDeleteBinLine } from '@remixicon/react'
import { useContext } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import type { Project } from 'generated/prisma/browser'
import type { ReactNode } from 'react'
import type { ProjectWithLogsCount } from '@/lib/types'
import { ProjectContext } from '@/lib/context/project'
import { copyToClipboard } from '@/lib/clipboard'

type ProjectDropdownProps = {
  children: ReactNode
  project: ProjectWithLogsCount | Project
}

export function ProjectDropdown({ children, project }: ProjectDropdownProps) {
  // Context
  const { setDeletingProject, setIsDeletingProject } =
    useContext(ProjectContext)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuItem
          onSelect={() => {
            toast.promise(
              axios.get('/api/ip').then((res) => {
                const url = `http://${res.data}:${window.location.port}/api/projects/${project.id}/logs/ingest`

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

        <DropdownMenuItem
          onSelect={() => {
            toast.promise(copyToClipboard(project.id), {
              loading: 'Loading...',
              success: `Project ID copied to clipboard`,
              error: 'Failed to copy project ID to clipboard',
            })
          }}
        >
          <RiClipboardLine />
          Copy project ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            setDeletingProject(project)
            setIsDeletingProject(true)
          }}
        >
          <RiDeleteBinLine />
          Delete project...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
