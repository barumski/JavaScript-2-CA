import { PROFILES_URL, NOROFF_API_KEY } from './api/api.mjs';
import { getFromLocalStorage } from './utilities.mjs';
import { logoutUser } from './auth/logout.mjs';
import { setupPostSearch } from './search/search.mjs';

setupPostSearch('#searchInput', [], () => {});

const accessToken = getFromLocalStorage('accessToken');

if (!accessToken) {
    console.warn('No access token found, redirecting to login page.');
    window.location.href = '../login.html';
}

logoutUser({
    selector: '#logout',
    redirectPath: '../login.html',
    clearAll: false,
});

const params = new URLSearchParams(window.location.search);
const authorName = params.get('name');

const headingEl = document.getElementById('authorNameHeading');
const postsContainer = document.getElementById('authorPostsContainer');

if (headingEl) {
    headingEl.textContent = authorName || '';
}

if (!authorName) {
    if (postsContainer) {
        postsContainer.textContent = 'No author name provided';
    }
    throw new Error('Missing ?name= in URL');
}

async function fetchAuthorPosts(name) {
    try {
        const url = `${PROFILES_URL}/${encodeURIComponent(name)}/posts`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY, 
            },
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch author posts:', json);
            if (postsContainer) {
                postsContainer.textContent = 'Could not load posts for this author';
            }
            return [];
        }

        return json.data || [];
    }   catch(error) {
        console.error('Error fetching author posts:', error);
        if (postsContainer) {
            postsContainer.textContent = 'An error occurred while loading posts.';
        }
        return [];
    }
}

function renderAuthorPosts(posts = []) {
    if (!postsContainer) return;

    postsContainer.textContent = '';

    postsContainer.classList.add('author-posts-container');

    if (!Array.isArray(posts) || posts.length === 0) {
        postsContainer.textContent = 'This author has no posts yet.';
        return;
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        const link = document.createElement('a');
        link.href = `/posts/post.html?id=${post.id}`;
        link.classList.add('post-link');

        const card = document.createElement('article');
        card.classList.add('post-card');

        const img = document.createElement('img');
        img.classList.add('post-image');
        img.src = post.media?.url || 'https://via.placeholder.com/600x400?text=No+Image';
        img.alt = post.media?.alt || post.title || 'Post image';

        const title = document.createElement('h2');
        title.classList.add('post-title');
        title.textContent = post.title || 'Untitled Post';

        const meta = document.createElement('div');
        meta.classList.add('post-meta');

        const createdDate = post.created ? new Date(post.created) : null;
        const updatedDate = post.updated ? new Date(post.updated) : null;

        const createdSpan = document.createElement('span');
        createdSpan.classList.add('post-date');
        createdSpan.textContent = createdDate
            ? `Created: ${createdDate.toLocaleDateString('no-NO')}`
            :'Created: N/A';

        const updatedSpan = document.createElement('span');
        updatedSpan.classList.add('post-date');

        if (updatedDate && (!createdDate || updatedDate.getTime() !== createdDate.getTime())) {
        updatedSpan.textContent = `Updated: ${updatedDate.toLocaleDateString('no-NO')}`;
        } else {
        updatedSpan.textContent = ''; 
        }
        
        meta.append(createdSpan, updatedSpan);
        
        card.append(img, title, meta);
        link.append(card);
        postsContainer.append(link);
    }
}

async function main() {
    const posts = await fetchAuthorPosts(authorName);
    renderAuthorPosts(posts);
}

main();