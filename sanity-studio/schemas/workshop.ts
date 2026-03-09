export default {
    name: 'workshop',
    title: 'Workshop',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'date',
            title: 'Date',
            type: 'string',
        },
        {
            name: 'location',
            title: 'Location',
            type: 'string',
        },
        {
            name: 'duration',
            title: 'Duration',
            type: 'string',
        },
        {
            name: 'participants',
            title: 'Max Participants',
            type: 'string',
        },
        {
            name: 'type',
            title: 'Type',
            type: 'string',
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Open', value: 'Open' },
                    { title: 'Filling Fast', value: 'Filling Fast' },
                    { title: 'Closed', value: 'Closed' },
                ],
            },
        },
        {
            name: 'price',
            title: 'Price',
            type: 'string',
            initialValue: 'Contact for Pricing',
        },
    ],
}
