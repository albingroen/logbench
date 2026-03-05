import axios from 'axios'
import { Link, useLocation } from '@tanstack/react-router'
import { RiAddLine, RiBox1Line } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Logo } from '../logo'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ProjectSearch } from './partials/project-search'
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

  // Local state
  const [projectSearch, setProjectSearch] = useState<string>('')

  // Server state
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      axios.get<Array<Project>>('/api/projects').then((res) => res.data),
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
