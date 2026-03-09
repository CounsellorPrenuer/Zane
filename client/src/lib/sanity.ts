import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "a097zl0k",
    dataset: "production",
    useCdn: false, // set to `false` to bypass the edge cache
    apiVersion: "2024-03-06", // use current date (YYYY-MM-DD) to target the latest API version
    token: import.meta.env.VITE_SANITY_API_TOKEN || "sk5gBjRTnUmoXOerJYhDzR3MG1WAT1Tn7hImPjMKcRTYvXe4xIP6QfFF0VTXFLHGOSKrEU4njRr7e2syMmUL7ujUNyxlBPNhmsObhF1AThlYezG0qeUVHw7iw99cdrx4DEBAPZjXRc2wktJWwtU0DvRKhbMcp1ZxNLaV7mYa1tEyQkbyYmV3",
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
    return builder.image(source);
}
