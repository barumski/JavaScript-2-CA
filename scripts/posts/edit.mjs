import { NOROFF_API_KEY, POSTS_URL } from '../api/api.mjs';
import { getFromLocalStorage } from '../utilities.mjs';
import { logoutUser } from '../auth/logout.mjs';
import { setupPostSearch } from '../search/search.mjs';

setupPostSearch('#searchInput', [], () => {});

const form = document.querySelector('#editPostForm');
const message = document.querySelector('#editMessage');

const accessToken = getFromLocalStorage('accessToken');
const currentUser = getFromLocalStorage('userName');

if (!accessToken) {
    console.warn('No access token found, redirecting to login page');
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
    if (message) {
        message.textContent = 'No post ID provided.';
        message.style.color = 'red'; 
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
        console.error('Failed to fetch post for edit:', json);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            window.location.href = '../login.html';
        }

        return null;
    }

    return json.data;
   }catch (error) {
    console.error('Error fetching post for edit', error);
    return null;
   }
}

function isOWner(post) {
    if (!form || !post) return;

    form.elements.title.value = post.title || '';
    form.elements.body.value = post.body || '';
    form.elements.mediaUrl.value = post?.media?.url || '';
    form.elements.mediaAlt.value = post?.media?.alt || '';
}

async function update(postId, payload) {
    try {
        const respone = await fetch(`${POSTS_URL}/${encodeURIComponent}(postId)`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to update post:', json);
            throw new Error(json.error?.[0]?.message || 'Failed to update post');
        }

        return json.data;
    }   catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

function onEditFormSubmit(event) {
    event.preventDefault();
    if (!form) return;

    const formData = new FormData(form);

    const title = formData.get('title')?.toString().trim || '';
    const body = formData.get('body')?.toString().trim || '';
    const mediaUrl = formData.get('mediaUrl')?.toString().trim || '';
    const mediaAlt = formData.get('mediaAlt')?.toString().trim || '';

    if (!title) {
        message.textContent = 'Title is required.';
        message.style.color = 'red';
        return;
    }

    const payload = { title, body };

    if (mediaUrl) {
        payload.media = {
            url: mediaUrl,
            alt: mediaAlt || title,
        };
    }

    message.textContent = 'Saving changes...';
    message.style.color = 'inherit';

    updatePost(id, payload)
    .then((updatePost) => {
        console.log('Post updated:', updatedPost);
        message.textContent = 'Post updated. Redirecting...';
        message.style.color = 'green';

        setTimeout(() => {
            window.location.href = `/posts/post.html?id=${encodeURIComponent(id)}`;
        }, 800);
        })
        .catch((error) => {
            message.textContent = error.message || 'Something went wrong.';
            message.style.color = 'red';
        });
        
}

async function main() {
    const post = await fetchSinglePost(id);
    currentPost = post;

    if (!post) {
        if (message) {
            message.textContent = 'Post not found.';
            message.style.color = 'red';
        }
        if (form) {
            form.style.display = 'none';
        }
        return;
    }

    if (!isOWner(post)) {
        if (message) {
            message.textContent = 'You do not have permission to edit this post.';
            message.style.color = 'red';
        }
        if (form) {
            form.style.display = 'none';
        }
        return;
    }

    populateForm(post);

    if (form) {
        form.addEventListener('submit', onEditFormSubmit);
    }
}

main();


