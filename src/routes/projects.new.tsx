import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import type { ProjectCreateInput } from 'generated/prisma/models'
import type { Project } from 'generated/prisma/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewProjectHeader } from '@/components/new-project-header'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/projects/new')({
  component: RouteComponent,
})

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Project title must be at least 1 character.')
    .max(256, 'Project title must be at most 256 characters.'),
})

function RouteComponent() {
  // Router state
  const navigate = useNavigate()

  // Server state
  const queryClient = useQueryClient()

  const { mutateAsync: createProject } = useMutation({
    mutationFn: (body: ProjectCreateInput) =>
      axios.post<Project>('/api/projects', body).then((res) => res.data),
    onSuccess: (res) => {
      toast.success('Project created')
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
      title: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await new Promise((res) => {
        setTimeout(() => {
          res(true)
        }, 2000)
      })
      return createProject(value)
    },
  })

  return (
    <>
      <NewProjectHeader />

      <form
        className="p-6 max-w-screen-sm"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldSet>
          <FieldLegend>New project</FieldLegend>
          <FieldDescription>
            Create a new project to ingest logs to.
          </FieldDescription>
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoFocus
                      autoComplete="off"
                      placeholder="Mobile app"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      The title for your project. You can change this later.
                    </FieldDescription>
                  </Field>
                )
              }}
            />

            <Field orientation="horizontal" className="justify-end">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    Create project
                    {isSubmitting && <Spinner />}
                  </Button>
                )}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </>
  )
}
