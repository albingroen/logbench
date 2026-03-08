import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/project'

export const getProjects = createServerFn({ method: 'GET' }).handler(
  async () => {
    return prisma.project.findMany({
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
    })
  },
)

export const getProject = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.project.findUnique({
      where: {
        id: data.projectId,
      },
    })
  })

export const createProject = createServerFn({ method: 'POST' })
  .inputValidator(projectSchema)
  .handler(async ({ data }) => {
    return prisma.project.create({
      data: {
        title: data.title,
      },
    })
  })

export const updateProject = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ projectId: z.string(), data: projectSchema }))
  .handler(async ({ data }) => {
    return prisma.project.update({
      where: {
        id: data.projectId,
      },
      data: data.data,
    })
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    return prisma.project.delete({
      where: {
        id: data.projectId,
      },
    })
  })
