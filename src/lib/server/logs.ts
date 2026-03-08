import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'

export const getLogs = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.log.findMany({
      where: {
        projectId: data.projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

export const getLog = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ logId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.log.findUnique({
      where: {
        id: data.logId,
      },
    })
  })

export const updateLog = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      logId: z.string(),
      data: z
        .object({
          annotation: z.string().nullable(),
          isBookmarked: z.boolean(),
        })
        .partial(),
    }),
  )
  .handler(async ({ data }) => {
    return prisma.log.update({
      where: {
        id: data.logId,
      },
      data: data.data,
    })
  })

export const deleteLog = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ logId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.log.delete({
      where: {
        id: data.logId,
      },
    })
  })

export const deleteLogs = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.log.deleteMany({
      where: {
        projectId: data.projectId,
      },
    })
  })
