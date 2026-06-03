import { dataset, projectId } from '@repo/cms/env'
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: { projectId, dataset },
})
