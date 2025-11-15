import { NOROFF_API_KEY, POSTS_URL } from "./api/api.mjs";
import { getFromLocalStorage } from "./utilities.mjs";

export async function deletePost(postId) {
    const accessToken = getFromLocalStorage("accessToken");

    if (!accessToken) {
        alert("You are not logged in.");
        window.location.href = "/login.html";
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${POSTS_URL}/${encodeURIComponent(postId)}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Noroff-API-Key": NOROFF_API_KEY,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Delete failed:", error);
            alert("Something went wrong while deleting the post.");
            return;
        }

        alert("Post successfully deleted");
        window.location.href = "/posts/feed.html"; 
    }   catch (error) {
        console.error("Error deleting post:", error);
        alert("Could not delete post due to a network error.");
    }
}