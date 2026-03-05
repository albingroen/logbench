import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import type { Project } from 'generated/prisma/browser'
import type { ProjectUpdateInput } from 'generated/prisma/models'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { projectSchema } from '@/lib/project'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/projects/$projectId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  // Router state
  const { projectId } = Route.useParams()
  const navigate = useNavigate()

  // Local state
  const [isOpen, setIsOpen] = useState<boolean>(true)

  // Server state
  const queryClient = useQueryClient()

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () =>
      axios.get<Project>(`/api/projects/${projectId}`).then((res) => res.data),
  })

  const { mutateAsync: updateProject } = useMutation({
    mutationFn: (body: ProjectUpdateInput) =>
      axios
        .put<Project>(`/api/projects/${projectId}`, body)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success('Project updated')
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      })
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

  // Form state
  const form = useForm({
    defaultValues: {
      title: project?.title ?? '',
    },
    validators: {
      onSubmit: projectSchema,
    },
    onSubmit: async ({ value }) => {
      return updateProject(value)
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false)
        setTimeout(() => {
          navigate({
            to: '/projects/$projectId',
            params: {
              projectId,
            },
          })
        }, 100)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>
            Here you can manage your project details
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder={project?.title ?? 'Mobile app'}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <Field orientation="horizontal" className="justify-end">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    Update project
                    {isSubmitting && <Spinner />}
                  </Button>
                )}
              />
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
