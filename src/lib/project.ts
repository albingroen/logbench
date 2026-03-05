import * as z from 'zod'

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title must be at least 1 character.')
    .max(256, 'Project title must be at most 256 characters.'),
})
