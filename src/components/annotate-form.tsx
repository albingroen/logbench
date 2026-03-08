import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from './ui/input-group'
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field'
import type { Log } from 'generated/prisma/browser'
import { updateLog as updateLogFn } from '@/lib/server/logs'
import { logSchema } from '@/lib/log'

type AnnotateFormProps = {
  annotation: Log['annotation']
  logId: Log['id']
}

export function AnnotateForm({ annotation, logId }: AnnotateFormProps) {
  // Server state
  const queryClient = useQueryClient()

  const { mutateAsync: updateLog } = useMutation({
    mutationFn: (body: {
      annotation?: string | null
      isBookmarked?: boolean
    }) => updateLogFn({ data: { logId, data: body } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', res.projectId, 'logs'],
      })

      toast.success('Annotation saved')

      form.setFieldMeta('annotation', {
        isTouched: false,
        isDirty: false,
        errorMap: {},
        errorSourceMap: {},
        isBlurred: false,
        isValidating: false,
      })
    },
    onError: () => {
      toast.error('Failed to annotate log')
    },
  })

  // Form state
  const form = useForm({
    defaultValues: {
      annotation,
    },
    validators: {
      onSubmit: logSchema,
    },
    onSubmit: async ({ value }) => {
      return updateLog(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="annotation"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="annotation" className="sr-only">
                Annotation
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  rows={10}
                  id={field.name}
                  name={field.name}
                  autoCorrect="off"
                  autoComplete="off"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                  placeholder="This log is…"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault()
                      form.handleSubmit()
                    }
                  }}
                />
                <InputGroupAddon align="block-end">
                  <Field orientation="horizontal" className="justify-end">
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                        state.isDirty,
                      ]}
                      children={([canSubmit, isSubmitting, isDirty]) => (
                        <InputGroupButton
                          size="sm"
                          type="submit"
                          variant="default"
                          disabled={!canSubmit || isSubmitting || !isDirty}
                        >
                          Save
                        </InputGroupButton>
                      )}
                    />
                  </Field>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
              <FieldDescription>
                Jot down anything you want to remember about this log.
              </FieldDescription>
            </Field>
          )
        }}
      />
    </form>
  )
}
