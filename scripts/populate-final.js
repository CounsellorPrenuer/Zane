import { createClient } from "@sanity/client";

const client = createClient({
    projectId: "a097zl0k",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-03-06",
    token: "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

async function populateData() {
    console.log("Starting comprehensive Mentoria & Blog data population...");

    // 1. Standard Mentoria Packages
    const standardPlans = [
        // 8-9 Students
        { planId: "pkg-1", name: "Discover", subgroup: "8-9 Students", category: "8-9", price: 5500, tier: "standard", features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Live webinar invites"] },
        { planId: "pkg-2", name: "Discover Plus+", subgroup: "8-9 Students", category: "8-9", price: 15000, tier: "premium", features: ["Psychometric assessments", "8 career counselling sessions (1/year)", "Custom reports & study abroad guidance", "CV building"] },

        // 10-12 Students
        { planId: "pkg-3", name: "Achieve Online", subgroup: "10-12 Students", category: "10-12", price: 10000, tier: "standard", features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { planId: "pkg-4", name: "Achieve Plus+", subgroup: "10-12 Students", category: "10-12", price: 25000, tier: "premium", features: ["Psychometric assessment", "4 career counselling sessions", "Custom reports & study abroad guidance", "CV reviews"] },

        // Graduates
        { planId: "pkg-5", name: "Ascend Online", subgroup: "Graduates", category: "graduates", price: 15000, tier: "standard", features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { planId: "pkg-6", name: "Ascend Plus+", subgroup: "Graduates", category: "graduates", price: 35000, tier: "premium", features: ["Psychometric assessment", "3 career counselling sessions", "Certificate/online course info", "CV reviews for jobs"] },

        // Working Professionals
        { planId: "pkg-7", name: "Ascend Online", subgroup: "Working Professionals", category: "professionals", price: 25000, tier: "standard", features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { planId: "pkg-8", name: "Ascend Plus+", subgroup: "Working Professionals", category: "professionals", price: 50000, tier: "premium", features: ["Psychometric assessment", "3 career counselling sessions", "Certificate/online course info", "CV reviews for jobs"] }
    ];

    for (const doc of standardPlans) {
        await client.createOrReplace({
            _id: `mentoria-std-${doc.planId}`,
            _type: "mentoriaPlan",
            ...doc,
            isCustom: false
        });
        console.log(`Created/Updated Standard Plan: ${doc.name} (${doc.subgroup})`);
    }

    // 2. Custom Packages
    const customPackages = [
        { planId: "career-report", name: "Career Report", price: 1500, description: "Get a detailed report of your psychometric assessment for a scientific analysis of your interests. Find out where your interests lie and which future paths you can potentially consider." },
        { planId: "career-report-counselling", name: "Career Report + Career Counselling", price: 5000, description: "Connect with India's top career coaches to analyse your psychometric report and shortlist the top three career paths you're most likely to enjoy and excel at." },
        { planId: "knowledge-gateway", name: "Knowledge Gateway + Career Helpline Access", price: 1500, description: "Unlock holistic information on your career paths and get direct access to Mentoria's experts, who will resolve your career-related queries through our dedicated Career Helpline." },
        { planId: "one-to-one-session", name: "One-to-One Session with a Career Expert", price: 3500, description: "Resolve your career queries and glimpse into your future world through a one-on-one session with an expert from your chosen field." },
        { planId: "college-admission-planning", name: "College Admission Planning", price: 35000, description: "Get unbiased recommendations and details on your future college options in India and abroad, organised in one resourceful planner." },
        { planId: "exam-stress-management", name: "Exam Stress Management", price: 2500, description: "Get expert guidance on tackling exam stress, planning your study schedule, revision tips and more from India's top educators." },
        { planId: "cap-100", name: "College Admissions Planner - 100 (CAP-100)", price: 100000, description: "A ranked list of the top 100 colleges in your course based on verified cut-offs. Ranks colleges into four tiers: Indian Ivy League, Target, Smart Backup, and Safe Bet." }
    ];

    for (const doc of customPackages) {
        await client.createOrReplace({
            _id: `mentoria-custom-${doc.planId}`,
            _type: "mentoriaPlan",
            ...doc,
            isCustom: true
        });
        console.log(`Created/Updated Custom Package: ${doc.name}`);
    }

    // 3. Blog Posts (Better samples)
    const blogs = [
        {
            _id: "blog-1",
            _type: "blog",
            title: "10 Tips for Choosing the Right Career Path",
            slug: { current: "10-tips-choosing-career-path" },
            summary: "Discover practical strategies to identify your ideal career based on your strengths, interests, and future market trends.",
            author: "Zane E. Cuxton",
            publishedAt: new Date().toISOString(),
            featured: true,
            content: [
                {
                    _type: "block",
                    children: [{ _type: "span", text: "Choosing a career path is one of the most significant decisions a student makes. Start by understanding your core interests..." }]
                }
            ]
        },
        {
            _id: "blog-2",
            _type: "blog",
            title: "How Parents Can Support Their Child's Career Decisions",
            slug: { current: "parents-support-career-decisions" },
            summary: "A guide for parents on how to nurture and guide their children's career aspirations without imposing their own choices.",
            author: "Zane E. Cuxton",
            publishedAt: new Date().toISOString(),
            featured: true,
            content: [
                {
                    _type: "block",
                    children: [{ _type: "span", text: "Parents play a crucial role in their child's career journey. The key is to be a facilitator rather than a director..." }]
                }
            ]
        },
        {
            _id: "blog-3",
            _type: "blog",
            title: "Emerging Careers in 2025: What You Need to Know",
            slug: { current: "emerging-careers-2025" },
            summary: "Explore the most promising career fields for the upcoming years and how to prepare yourself for the future of work.",
            author: "Zane E. Cuxton",
            publishedAt: new Date().toISOString(),
            featured: false,
            content: [
                {
                    _type: "block",
                    children: [{ _type: "span", text: "From AI ethics to sustainable energy architecture, the careers of tomorrow are being built today..." }]
                }
            ]
        }
    ];

    for (const doc of blogs) {
        await client.createOrReplace(doc);
        console.log(`Created/Updated Blog: ${doc.title}`);
    }

    for (const doc of blogs) {
        await client.createOrReplace(doc);
        console.log(`Created/Updated Blog: ${doc.title}`);
    }

    console.log("Data population complete!");
}

populateData().catch(console.error);
