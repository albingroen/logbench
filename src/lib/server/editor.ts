import { createServerFn } from '@tanstack/react-start'
import * as z from 'zod'
import launch from 'launch-editor'

export const launchEditor = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ fileName: z.string() }))
  .handler(({ data }) => {
    launch(data.fileName, (fileName, errorMsg) => {
      console.error(fileName, errorMsg)
    })
  })
