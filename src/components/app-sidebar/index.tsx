import { Link, useLocation } from '@tanstack/react-router'
import { RiAddLine, RiBox1Line, RiMoreLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Logo } from '../logo'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ProjectDropdown } from '../project-dropdown'
import { ProjectSearch } from './partials/project-search'
import { getProjects } from '@/lib/server/projects'
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

  // Server state
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
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
        <SidebarHeader className="pt-4 gap-3">
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
                    <ProjectDropdown project={project}>
                      <SidebarMenuAction showOnHover>
                        <RiMoreLine />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </ProjectDropdown>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </>
  )
}
