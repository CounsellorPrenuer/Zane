import { createClient } from "@sanity/client";

const client = createClient({
    projectId: "a097zl0k",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-03-06",
    token: "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

async function populateTestimonials() {
    console.log("Populating testimonials...");

    const testimonials = [
        {
            _id: 'testimonial-1',
            _type: 'testimonial',
            name: "Priya Sharma",
            role: "Software Engineer",
            company: "Tech Solutions Inc.",
            rating: 5,
            text: "The career guidance I received from ASK was invaluable. Zane helped me transition from finance to tech, and I'm now working at my dream company!",
            image: "PS",
            order: 1
        },
        {
            _id: 'testimonial-2',
            _type: 'testimonial',
            name: "Rajesh Kumar",
            role: "MBA Graduate",
            company: "Business School Alumni",
            rating: 5,
            text: "The admission guidance program helped me secure a spot at a top-tier business school. The personalized approach made all the difference.",
            image: "RK",
            order: 2
        },
        {
            _id: 'testimonial-3',
            _type: 'testimonial',
            name: "Sarah Johnson",
            role: "Marketing Manager",
            company: "Digital Agency",
            rating: 5,
            text: "The workshops were incredibly practical and immediately applicable to my work. Highly recommend for anyone looking to upskill.",
            image: "SJ",
            order: 3
        }
    ];

    for (const testimonial of testimonials) {
        await client.createOrReplace(testimonial);
        console.log(`Created/Updated Testimonial: ${testimonial.name}`);
    }

    console.log("Testimonial population complete!");
}

populateTestimonials().catch(console.error);
