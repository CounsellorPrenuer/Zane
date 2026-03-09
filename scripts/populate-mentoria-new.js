import { createClient } from "@sanity/client";

const client = createClient({
    projectId: "a097zl0k",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-03-06",
    token: "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

async function populateData() {
    console.log("Starting Mentoria data population...");

    // 1. Standard Mentoria Packages
    const standardPlans = [
        // 8-9 Students
        { _type: "mentoriaPlan", planId: "pkg-1", name: "Discover", subgroup: "8-9 Students", price: 5500, features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Live webinar invites"] },
        { _type: "mentoriaPlan", planId: "pkg-2", name: "Discover Plus+", subgroup: "8-9 Students", price: 15000, features: ["Psychometric assessments", "8 career counselling sessions (1/year)", "Custom reports & study abroad guidance", "CV building"] },

        // 10-12 Students
        { _type: "mentoriaPlan", planId: "pkg-3", name: "Achieve Online", subgroup: "10-12 Students", price: 5999, features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { _type: "mentoriaPlan", planId: "pkg-4", name: "Achieve Plus+", subgroup: "10-12 Students", price: 10599, features: ["Psychometric assessment", "4 career counselling sessions", "Custom reports & study abroad guidance", "CV reviews"] },

        // Graduates
        { _type: "mentoriaPlan", planId: "pkg-5", name: "Ascend Online", subgroup: "Graduates", price: 6499, features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { _type: "mentoriaPlan", planId: "pkg-6", name: "Ascend Plus+", subgroup: "Graduates", price: 10599, features: ["Psychometric assessment", "3 career counselling sessions", "Certificate/online course info", "CV reviews for jobs"] },

        // Working Professionals
        { _type: "mentoriaPlan", planId: "mp-3", name: "Ascend Online", subgroup: "Working Professionals", price: 6499, features: ["Psychometric assessment", "1 career counselling session", "Lifetime Knowledge Gateway access", "Pre-recorded webinars"] },
        { _type: "mentoriaPlan", planId: "mp-2", name: "Ascend Plus+", subgroup: "Working Professionals", price: 10599, features: ["Psychometric assessment", "3 career counselling sessions", "Certificate/online course info", "CV reviews for jobs"] }
    ];

    for (const doc of standardPlans) {
        // Use planId as part of the unique ID to avoid collisions
        await client.createOrReplace({
            _id: `mentoria-std-${doc.planId}`,
            ...doc,
            isCustom: false
        });
        console.log(`Created/Updated Standard Plan: ${doc.name} (${doc.subgroup})`);
    }

    // 2. Custom Packages
    const customPackages = [
        { planId: "career-report", name: "Career Report", price: 1500, description: "Get a detailed report of your psychometric assessment for a scientific analysis of your interests. Find out where your interests lie and which future paths you can potentially consider." },
        { planId: "career-report-counselling", name: "Career Report + Career Counselling", price: 3000, description: "Connect with India's top career coaches to analyse your psychometric report and shortlist the top three career paths you're most likely to enjoy and excel at." },
        { planId: "knowledge-gateway", name: "Knowledge Gateway + Career Helpline Access", price: 100, description: "Unlock holistic information on your career paths and get direct access to Mentoria's experts, who will resolve your career-related queries through our dedicated Career Helpline. Validate your career decisions from now until you land a job you love." },
        { planId: "one-to-one-session", name: "One-to-One Session with a Career Expert", price: 3500, description: "Resolve your career queries and glimpse into your future world through a one-on-one session with an expert from your chosen field." },
        { planId: "college-admission-planning", name: "College Admission Planning", price: 3000, description: "Get unbiased recommendations and details on your future college options in India and abroad, organised in one resourceful planner." },
        { planId: "exam-stress-management", name: "Exam Stress Management", price: 1000, description: "Get expert guidance on tackling exam stress, planning your study schedule, revision tips and more from India's top educators. Increase your chances of acing exams with a calm and clear mind." },
        { planId: "cap-100", name: "College Admissions Planner - 100 (CAP-100)", price: 199, description: "₹199 for a ranked list of the top 100 colleges in your course. Get an expert-curated list of colleges based on verified cut-offs. CAP-100 ranks the top 100 colleges into four tiers to help you plan smarter: Indian Ivy League, Target, Smart Backup, and Safe Bet colleges. You can then shortlist colleges based on where you stand!" }
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

    console.log("Data population complete!");
}

populateData().catch(console.error);
