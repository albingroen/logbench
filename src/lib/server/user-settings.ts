import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/prisma'
import { userSettingsSchema } from '@/lib/user-settings'

const SETTINGS_ID = 'default'

export const getUserSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    return prisma.userSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    })
  },
)

export const updateUserSettings = createServerFn({ method: 'POST' })
  .inputValidator(userSettingsSchema.partial())
  .handler(async ({ data }) => {
    return prisma.userSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    })
  })
