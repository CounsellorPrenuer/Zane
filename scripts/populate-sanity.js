import { createClient } from "@sanity/client";

const client = createClient({
    projectId: "a097zl0k",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-03-06",
    token: "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

async function populateData() {
    console.log("Starting data population...");

    // 1. Mentoria Programs
    const mentoriaPrograms = [
        { _type: "mentoriaPlan", name: "Discover", category: "8-9", tier: "standard", price: 5500, paymentButtonId: "pl_RwDuOx96VYrsyN", features: ["Psychometric assessment", "1 career counselling session", "Lifetime access to Knowledge Gateway", "Invites to live webinars"] },
        { _type: "mentoriaPlan", name: "Discover Plus+", category: "8-9", tier: "premium", price: 15000, paymentButtonId: "pl_RwDq8XpK76OhB3", features: ["Psychometric assessments", "8 career counselling sessions", "Lifetime access to Knowledge Gateway", "Invites to live webinars", "Customized reports", "Guidance on studying abroad", "CV building"] },
        { _type: "mentoriaPlan", name: "Achieve Online", category: "10-12", tier: "standard", price: 5999, paymentButtonId: "pl_RwDxvLPQP7j4rG", features: ["Psychometric assessment", "1 career counselling session", "Lifetime access to Knowledge Gateway", "Pre-recorded webinars"] },
        { _type: "mentoriaPlan", name: "Achieve Plus+", category: "10-12", tier: "premium", price: 10599, paymentButtonId: "pl_RwDzfVkQYEdAIf", features: ["Psychometric assessment", "4 career counselling sessions", "Lifetime access to Knowledge Gateway", "Attend live webinars", "Customized reports", "Guidance on studying abroad", "CV reviews"] },
        { _type: "mentoriaPlan", name: "Ascend Online", category: "graduates", tier: "standard", price: 5999, paymentButtonId: "pl_RwE1evNHrHWJDW", features: ["Psychometric assessment", "1 career counselling session", "Lifetime access to Knowledge Gateway", "Pre-recorded webinars"] },
        { _type: "mentoriaPlan", name: "Ascend Plus+", category: "graduates", tier: "premium", price: 10599, paymentButtonId: "pl_RwE3WEILWB9WeJ", features: ["Psychometric assessment", "3 career counselling sessions", "Lifetime access to Knowledge Gateway", "Attend live webinars", "Customized reports", "Guidance on studying abroad", "CV reviews"] }
    ];

    for (const doc of mentoriaPrograms) {
        await client.createOrReplace({ _id: `mentoria-${doc.category}-${doc.tier}`, ...doc });
        console.log(`Created/Updated Mentoria Plan: ${doc.name}`);
    }

    // 2. ASK Workshops
    const askWorkshops = [
        { _type: "workshop", title: "Communication & Presentation Skills", description: "Develop proficiency in dialogue, persuasion, and conducting fruitful meetings.", date: "Contact for Schedule", location: "Bangalore / On-site", duration: "2 Days (12 hrs)", participants: "25", type: "Behavioural Skills", status: "Open" },
        { _type: "workshop", title: "Team Building & Leadership", description: "Learn to develop and sustain productive teams.", date: "Contact for Schedule", location: "Bangalore / On-site", duration: "2 Days (12 hrs)", participants: "30", type: "Leadership Development", status: "Open" }
    ];

    for (let i = 0; i < askWorkshops.length; i++) {
        const doc = askWorkshops[i];
        await client.createOrReplace({ _id: `workshop-${i}`, ...doc });
        console.log(`Created/Updated Workshop: ${doc.title}`);
    }

    // 3. Blogs
    const blogs = [
        { _type: "blog", title: "Choosing the Right Career Path", slug: { _type: "slug", current: "choosing-right-career-path" }, summary: "Finding your vocation is more than just picking a job.", content: [{ _key: "c1", _type: "block", children: [{ _key: "s1", _type: "span", text: "Career guidance is essential for students..." }] }], author: "Mentoria", publishedAt: new Date().toISOString(), featured: true },
        { _type: "blog", title: "The Importance of Soft Skills", slug: { _type: "slug", current: "importance-soft-skills" }, summary: "Soft skills are becoming increasingly important in the modern workplace.", content: [{ _key: "c2", _type: "block", children: [{ _key: "s2", _type: "span", text: "In today's world, technical skills aren't enough..." }] }], author: "ASK Team", publishedAt: new Date().toISOString(), featured: false }
    ];

    for (let i = 0; i < blogs.length; i++) {
        const doc = blogs[i];
        await client.createOrReplace({ _id: `blog-${i}`, ...doc });
        console.log(`Created/Updated Blog: ${doc.title}`);
    }

    console.log("Data population complete!");
}

populateData().catch(console.error);
