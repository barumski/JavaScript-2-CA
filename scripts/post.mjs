import { NOROFF_API_KEY, POSTS_URL } from "./api/api.mjs";
import { getFromLocalStorage } from "./utilities.mjs";
import { logoutUser } from "./auth/logout.mjs"; 

const container = document.getElementById('singlePostContainer');

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
const id = params.get('id');

if (!id) {
    container.textContent = 'No post ID provided';
    throw new Error('Missing ?id= in URL');
}

async function fetchSinglePost(postId) {
    try {
        const url = `${POSTS_URL}/${encodeURIComponent(postId)}?_author=true`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY,
            },
        });
        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch post:', json);
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userName');
                window.location.href = '../login.html';
            }
            return null;
        }
        
        return json.data;
        } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

function renderSinglePost(post) {
    container.textContent = '';

    if (!post) {
        container.textContent = 'Post not found';
        return
    }

    const article = document.createElement('article');
    article.classList.add('post-card', 'post-card--single');

    const img = document.createElement('img');
    img.classList.add('post-image');
    img.src = post?.media?.url || 'https://via.placeholder.com/1200x500?text=No+Image';
    img.alt = post?.media?.alt || 'Post image';

    const title = document.createElement('h1');
    title.classList.add('post-title');
    title.textContent = post?.title || 'Untitled Post';

    const author = document.createElement('p');
    author.classList.add('post-author');
    const authorName = post?.author?.name || post?.author?.username || 'Unknown Author';
    author.textContent = `By ${authorName}`;

    const body = document.createElement('p');
    body.classList.add('post-body');
    body.textContent = post?.body || '';

    const backLink = document.createElement('a');
    backLink.href = '/posts/feed.html';
    backLink.classList.add('btn-back');
    backLink.textContent = '← Back';

    article.append(img, title, author, body, backLink);
    container.append(article);
}

async function main() {
    const post = await fetchSinglePost(id);
    renderSinglePost(post);
}

main();