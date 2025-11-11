import { NOROFF_API_KEY, POSTS_URL } from './scripts/api/api.mjs';
import { getFromLocalStorage } from './scripts/utilities.mjs';

const postContainer = document.getElementById('postContainer');

async function fetchPosts() {
  try {
    const accessToken = getFromLocalStorage('accessToken');
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Noroff-API-Key': NOROFF_API_KEY,
      },
    };
    const response = await fetch(POSTS_URL, fetchOptions);
    const json = await response.json();
    return json.data
  } catch(error) {
    console.error('Error fetching posts:', error);
  }
}

function generatePosts(posts) {
  postContainer.textContent = '';
}

async function main() {
  const posts = await fetchPosts();
  generatePosts(posts);
}

main();