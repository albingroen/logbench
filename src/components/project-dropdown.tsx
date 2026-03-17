import {
  RiClipboardLine,
  RiDeleteBinLine,
  RiSettingsLine,
} from '@remixicon/react'
import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
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
import { copyWithToast } from '@/lib/clipboard'

type ProjectDropdownProps = {
  children: ReactNode
  project: ProjectWithLogsCount | Project
  align?: 'start' | 'end'
}

export function ProjectDropdown({
  children,
  project,
  align = 'start',
}: ProjectDropdownProps) {
  // Context
  const { setDeletingProject, setIsDeletingProject } =
    useContext(ProjectContext)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align={align}>
        <DropdownMenuItem
          onSelect={() =>
            copyWithToast(
              `${window.location.origin}/api/projects/${project.id}/logs/ingest`,
              'POST URL',
            )
          }
        >
          <RiClipboardLine />
          Copy POST URL
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => copyWithToast(project.id, 'Project ID')}
        >
          <RiClipboardLine />
          Copy project ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/projects/$projectId/settings"
            params={{ projectId: project.id }}
          >
            <RiSettingsLine />
            Project settings
          </Link>
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
