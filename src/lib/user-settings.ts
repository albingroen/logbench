import * as z from 'zod'

export const userSettingsSchema = z.object({
  preferRawJSON: z.boolean().default(false),
})
