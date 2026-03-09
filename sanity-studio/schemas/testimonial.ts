export default {
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'role',
            title: 'Role',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'company',
            title: 'Company',
            type: 'string',
        },
        {
            name: 'rating',
            title: 'Rating (1-5)',
            type: 'number',
            validation: (Rule: any) => Rule.min(1).max(5).integer(),
        },
        {
            name: 'text',
            title: 'Testimonial Text',
            type: 'text',
            validation: (Rule: any) => Rule.required().max(300),
        },
        {
            name: 'image',
            title: 'Initials/Image Placeholder',
            type: 'string',
            description: 'Initials to show if no image (e.g. PS)',
        },
        {
            name: 'order',
            title: 'Display Order',
            type: 'number',
        },
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'role',
        },
    },
}
