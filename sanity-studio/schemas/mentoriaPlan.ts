export default {
    name: 'mentoriaPlan',
    title: 'Mentoria Plan',
    type: 'document',
    fields: [
        {
            name: 'planId',
            title: 'Plan ID',
            type: 'string',
            description: 'Internal ID for the plan (e.g., pkg-1, career-report)',
        },
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'Title of the plan (e.g., Discover, Career Report)',
        },
        {
            name: 'subgroup',
            title: 'Subgroup',
            type: 'string',
            description: 'Target audience (e.g., 8-9 Students, Graduates)',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'string',
            description: 'Category key used for filtering (e.g., 8-9, 10-12, graduates, professionals)',
        },
        {
            name: 'price',
            title: 'Price (₹)',
            type: 'number',
        },
        {
            name: 'isCustom',
            title: 'Is Custom Package?',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'tier',
            title: 'Tier',
            type: 'string',
            options: {
                list: [
                    { title: 'Standard', value: 'standard' },
                    { title: 'Premium', value: 'premium' },
                ],
            },
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'Detailed description for custom packages',
        },
        {
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Bullet points for standard packages',
        },
        {
            name: 'paymentButtonId',
            title: 'Razorpay Button ID',
            type: 'string',
            description: 'The data-payment_button_id from Razorpay',
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            description: 'Image for custom packages',
        },
    ],
}
