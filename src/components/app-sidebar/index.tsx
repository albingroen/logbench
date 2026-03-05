import axios from 'axios'
import { Link, useLocation } from '@tanstack/react-router'
import {
  RiAddLine,
  RiBox1Line,
  RiDeleteBinLine,
  RiMoreLine,
} from '@remixicon/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Logo } from '../logo'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { ProjectSearch } from './partials/project-search'
import type { ProjectWithLogsCount } from '@/lib/types'
import type { Project } from 'generated/prisma/browser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  // Router state
  const { pathname } = useLocation()

  // Local state
  const [projectSearch, setProjectSearch] = useState<string>('')
  const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false)
  const [deletingProject, setDeletingProject] = useState<ProjectWithLogsCount>()

  // Server state
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      axios
        .get<Array<ProjectWithLogsCount>>('/api/projects')
        .then((res) => res.data),
  })

  const { mutate: deleteProject } = useMutation({
    mutationFn: (projectId: Project['id']) =>
      axios
        .delete<Project>(`/api/projects/${projectId}`)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success('Project deleted')
      setIsDeletingProject(false)

      // refetchProjects()
      // queryClient.invalidateQueries({
      //   queryKey: ['projects', res.id],
      // })

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'projects' || query.queryKey[1] === res.id,
      })

      setTimeout(() => {
        setDeletingProject(undefined)
      }, 100)
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  // Helpers
  const filteredProjects = useMemo(
    () =>
      projectSearch
        ? projects?.filter((p) =>
            p.title.toLowerCase().includes(projectSearch.toLowerCase()),
          )
        : projects,
    [projects, projectSearch],
  )

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupContent>
              <Logo />
            </SidebarGroupContent>
          </SidebarGroup>
          <ProjectSearch value={projectSearch} onChange={setProjectSearch} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarGroupAction asChild>
                  <Link to="/projects/new">
                    <RiAddLine />
                  </Link>
                </SidebarGroupAction>
              </TooltipTrigger>
              <TooltipContent side="right">New project</TooltipContent>
            </Tooltip>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredProjects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`/projects/${project.id}`)}
                    >
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: project.id }}
                      >
                        <RiBox1Line />
                        {project.title}
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <RiMoreLine />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-48">
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
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>

      <AlertDialog
        open={isDeletingProject}
        onOpenChange={() => {
          setIsDeletingProject(false)
          setTimeout(() => {
            setDeletingProject(undefined)
          }, 100)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete <q>{deletingProject?.title}</q>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project{' '}
              <q>{deletingProject?.title}</q>?
              {deletingProject?._count.logs
                ? ` This will delete ${deletingProject._count.logs} log(s) as well.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!deletingProject) {
                  return
                }

                deleteProject(deletingProject.id)
              }}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
