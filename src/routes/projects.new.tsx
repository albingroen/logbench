import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProject as createProjectFn } from '@/lib/server/projects'
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
import { projectSchema } from '@/lib/project'

export const Route = createFileRoute('/projects/new')({
  component: RouteComponent,
})

function RouteComponent() {
  // Router state
  const navigate = useNavigate()

  // Server state
  const queryClient = useQueryClient()

  const { mutateAsync: createProject } = useMutation({
    mutationFn: (body: { title: string }) => createProjectFn({ data: body }),
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
      onSubmit: projectSchema,
    },
    onSubmit: async ({ value }) => {
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
                      autoFocus
                      id={field.name}
                      name={field.name}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Mobile app"
                      onChange={(e) => field.handleChange(e.target.value)}
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
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                  state.isDirty,
                ]}
                children={([canSubmit, isSubmitting, isDirty]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting || !isDirty}
                  >
                    Create project
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
