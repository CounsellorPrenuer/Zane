export default {
    name: 'blog',
    title: 'Blog',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        },
        {
            name: 'summary',
            title: 'Summary',
            type: 'text',
        },
        {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [{ type: 'block' }],
        },
        {
            name: 'author',
            title: 'Author',
            type: 'string',
            initialValue: 'Mentoria',
        },
        {
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        },
        {
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            initialValue: false,
        },
    ],
}
