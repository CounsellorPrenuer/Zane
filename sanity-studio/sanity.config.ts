import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'

export default defineConfig({
    name: 'default',
    title: 'Zane Mentorship Studio',

    projectId: 'a097zl0k',
    dataset: 'production',

    plugins: [deskTool()],

    schema: {
        types: schemaTypes,
    },
})
