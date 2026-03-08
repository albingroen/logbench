import { createContext, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Project } from 'generated/prisma/browser'
import type { ProjectWithLogsCount } from '../types'
import type { ReactNode } from 'react'
import { deleteProject as deleteProjectFn } from '@/lib/server/projects'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const ProjectContext = createContext<{
  isDeletingProject: boolean
  deletingProject?: ProjectWithLogsCount | Project
  setIsDeletingProject: (value: boolean) => void
  setDeletingProject: (value: ProjectWithLogsCount | Project) => void
}>({
  deletingProject: undefined,
  isDeletingProject: false,
  setIsDeletingProject: () => undefined,
  setDeletingProject: () => undefined,
})

type ProjectProviderProps = {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  // Local state
  const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false)
  const [deletingProject, setDeletingProject] = useState<
    ProjectWithLogsCount | Project
  >()

  // Server state
  const queryClient = useQueryClient()

  const { mutate: deleteProject } = useMutation({
    mutationFn: (projectId: Project['id']) =>
      deleteProjectFn({ data: { projectId } }),
    onSuccess: () => {
      toast.success('Project deleted')
      setIsDeletingProject(false)

      queryClient.invalidateQueries({
        queryKey: ['projects'],
      })

      setTimeout(() => {
        setDeletingProject(undefined)
      }, 100)
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  return (
    <ProjectContext.Provider
      value={{
        deletingProject,
        isDeletingProject,
        setIsDeletingProject,
        setDeletingProject,
      }}
    >
      {children}

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
              {deletingProject &&
              '_count' in deletingProject &&
              deletingProject._count.logs
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
    </ProjectContext.Provider>
  )
}
