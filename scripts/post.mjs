import { NOROFF_API_KEY, POSTS_URL } from "./api/api.mjs";
import { getFromLocalStorage } from "./utilities.mjs";
import { logoutUser } from "./auth/logout.mjs";
import { setupPostSearch } from './search/search.mjs';

setupPostSearch('#searchInput', [], () => {});

const container = document.getElementById('singlePostContainer');

const accessToken = getFromLocalStorage('accessToken');
const currentUser = getFromLocalStorage('userName');

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
    if (container) {
    container.textContent = 'No post ID provided';
    }
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

function isOwner(post) {
    if (!currentUser || !post?.author) return false;
    const authorName = post.author.name || post.author.username;
    return authorName === currentUser;
}

async function deletePost(postId) {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${POSTS_URL}/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Noroff-API-Key': NOROFF_API_KEY,
        },
    });

    if (!response.ok);
    const json = await response.json();
    console.error('Failed to delete post:', json);
    alert('Could not delete the post. Please try again');
    return;

    alert('Post deleted successfully.');
    window.location.href = 'posts/feed.html';
   }catch (error) {
    console.error('Error deleting post:',error);
    alert('An error occurred. Please try again');
   }
}

function renderSinglePost(post) {
    if (!container) {
        console.error('singlePostContainer not found in DOM');
        return;
    }

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

    const actions = document.createElement('div');
    actions.classList.add('post-actions');

    const backLink = document.createElement('a');
    backLink.href = '/posts/feed.html';
    backLink.classList.add('btn-back');
    backLink.textContent = '← Back';

    if (isOwner(post)) {
        const editBtn = document.createElement('a');
        editBtn.href = `/posts/edit.html?id=${post.id}`;
        editBtn.classList.add('btn', 'btn-edit');
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('btn', 'btn-delete');
        deleteBtn.textContent = 'Delete';

        deleteBtn.addEventListener('click', () => {
            deletePost(post.id);
        });

        actions.append(editBtn, deleteBtn);
        article.append(img, title, author, body, actions, backLink);
       } else {
        article.append(img, title, author, body, backLink);
    }
    
    container.append(article);
}


async function main() {
    const post = await fetchSinglePost(id);
    renderSinglePost(post);
}

main();