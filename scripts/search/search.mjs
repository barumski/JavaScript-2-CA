  /**
   * Sets up client-side search for posts based on title and author name.
   * 
   * Listens to input events on the given search field and calls the callback
   * with filtered array of posts.
   * 
   * @param {string} searchInputSelector - CSS selector for the search input element.
   * @param {object[]} allPosts - The full list of posts that can be searched.
   * @param {(filteredPosts: Object[]) => void} onResult - Callback called with the filtered posts.
   */

export function setupPostSearch(searchInputSelector, allPosts, onResult) {
    const searchInput = document.querySelector(searchInputSelector);
    const clearBtn = document.querySelector('#clearSearch');

    if(!searchInput) {
        console.warn(`Search input not found: ${searchInputSelector}`);
        return;

    }

    const isFeedPage = window.location.pathname.includes('feed.html');

    if (isFeedPage) {
        searchInput.addEventListener("input", (event) => {
            const value = event.target.value.trim();
            if (value === "") {
                onResult(allPosts);
            }
        });
    }

    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            if (isFeedPage) {
                onResult(allPosts);
            }
            return;
        }

        if (!isFeedPage) {
            window.location.href = `/posts/feed.html?search=${encodeURIComponent(query)}`;
            return;
        }

        const lower = query.toLowerCase();

        const filtered = allPosts.filter((post) => {
            const title = (post?.title || "").toLowerCase();
            const authorName = (
                post?.author?.name ||
                post?.author?.username ||
                ""
            ).toLowerCase();

            return title.includes(lower)  || authorName.includes(lower);
        });
        
        onResult(filtered);
    });

    if (clearBtn && isFeedPage) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            onResult(allPosts, '');
            searchInput.focus();
        });
    }
}