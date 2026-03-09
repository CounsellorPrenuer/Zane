import { createClient } from "@sanity/client";

const client = createClient({
    projectId: "a097zl0k",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-03-06",
    token: "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

async function addCorsOrigin() {
    const origin = "https://counsellorprenuer.github.io";
    console.log(`Adding CORS origin: ${origin}`);

    try {
        // Sanity Management API for CORS origins
        const response = await fetch(`https://api.sanity.io/v1/projects/a097zl0k/cors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3`
            },
            body: JSON.stringify({
                origin: origin,
                allowCredentials: true
            })
        });

        if (response.ok) {
            console.log("CORS origin added successfully.");
        } else {
            const error = await response.json();
            console.error("Failed to add CORS origin:", error);
        }
    } catch (err) {
        console.error("Error adding CORS origin:", err);
    }
}

addCorsOrigin();
