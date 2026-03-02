import axios from 'axios'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { RiAddLine } from '@remixicon/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Logo } from '../logo'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { SearchForm } from './partials/search-form'
import type { ProjectCreateInput } from 'generated/prisma/models'
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
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  // Router state
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Server state
  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      axios.get<Array<Project>>('/api/projects').then((res) => res.data),
  })

  const { mutate: createProject } = useMutation({
    mutationFn: (body: ProjectCreateInput) =>
      axios.post<Project>('/api/projects', body).then((res) => res.data),
    onSuccess: (res) => {
      toast.success('Project created')
      refetchProjects()
      navigate({
        to: '/projects/$projectId',
        params: {
          projectId: res.id,
        },
      })
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <Logo />
          </SidebarGroupContent>
        </SidebarGroup>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarGroupAction
                onClick={() => {
                  createProject({
                    title: 'New project',
                  })
                }}
              >
                <RiAddLine />
              </SidebarGroupAction>
            </TooltipTrigger>
            <TooltipContent side="right">New project</TooltipContent>
          </Tooltip>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(`/projects/${project.id}`)}
                  >
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                    >
                      {project.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
