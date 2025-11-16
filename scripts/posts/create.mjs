import { NOROFF_API_KEY, POSTS_URL } from '../api/api.mjs';
import { getFromLocalStorage } from '../utilities.mjs';
import { logoutUser } from '../auth/logout.mjs';
import { setupPostSearch } from '../search/search.mjs';

setupPostSearch('#searchInput', [], () => {});

const form = document.querySelector('#createPostForm');
const message = document.querySelector('#createMessage');

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

async function createPost(postData) {
    try {
        const fetchOptions = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        };

        const response = await fetch(POSTS_URL, fetchOptions);
        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to create post:', json);
            throw new Error(json.errors?.[0]?.message || 'Failed to create post');
        }

        return json.data;
    } catch (error) {
        console.error('Error creating post', error);
        throw error;
    }
}

function onCreateFormSubmit(event) {
    event.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim() || '';
    const body = formData.get('body')?.toString().trim() || ''; 
    const mediaUrl = formData.get('mediaUrl')?.toString().trim() || '';
    const mediaAlt = formData.get('mediaAlt')?.toString().trim() || '';

    if (!title) {
        message.textContent = 'Title is required';
        message.computedStyleMap.color = 'var(--primary-color';
        return;
    }

    const postPayload = {
        title,
        body,
    };

    if (mediaUrl) {
        postPayload.media = {
            url: mediaUrl,
            alt: mediaAlt || title,
        };
    }

    message.textContent = 'Publishing post...';
    message.style.color = 'var(--primary-color';

    createPost(postPayload)
    .then((createdPost) => {
    console.log('Post created:', createdPost);
    window.location.href = '/posts/feed.html';
})
    .catch((error) => {
        message.textContent = error.message || 'Something went wrong';
        message.style.color = 'var(--primary-color';
    });
}

if (form) {
    form.addEventListener('submit', onCreateFormSubmit);
}