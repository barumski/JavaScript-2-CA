import { NOROFF_API_KEY, POSTS_URL } from './api/api.mjs';
import { getFromLocalStorage } from './utilities.mjs';
import { logoutUser } from './auth/logout.mjs';


const displayContainer = document.getElementById('displayContainer');

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


async function fetchPosts() {
  try {
    const accessToken = getFromLocalStorage('accessToken');

    if (!accessToken) {
      console.warn('No access token found, cannot fetch posts.');
      return [];
    }

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
    };

    const response = await fetch(POSTS_URL, fetchOptions);
    const json = await response.json();

    if (!response.ok) {
      console.error ('Failed to fetch posts:', json);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        window.location.href = '../login.html';
      }

      return [];
    }

    return json.data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

function generatePosts(posts) {
  displayContainer.textContent = '';

  if (posts.length === 0) {
    displayContainer.textContent = 'No posts available.';
    return;
  }

  for (let i = 0; i < posts.length; i++) {
    const postContainer = document.createElement('div');
    postContainer.classList.add('post-card');

    const title = document.createElement('h2');
    title.textContent = posts[i].title;

    const body = document.createElement('p');
    body.textContent = posts[i].body;

    postContainer.append(title, body);
    displayContainer.append(postContainer);
  }
}

async function main() {
  const posts = await fetchPosts();
  generatePosts(posts);
}

main();