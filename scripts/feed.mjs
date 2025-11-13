import { NOROFF_API_KEY, POSTS_URL } from './api/api.mjs';
import { getFromLocalStorage } from './utilities.mjs';
import { logoutUser } from './auth/logout.mjs';

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://')) url = url.replace('http://', 'https://');
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('unsplash.com') && u.pathname.startsWith('/photos/')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      if (id) {
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
      }
    }
    return url;
  } catch {
    return url;
  }
}


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

    const response = await fetch(`${POSTS_URL}?_author=true&_limit=100`, fetchOptions);
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

function generatePosts(posts = []) {
  displayContainer.textContent = '';

  if (!Array.isArray(posts) || posts.length === 0) {
    displayContainer.textContent = 'No posts available.';
    return;
  }

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    const link = document.createElement('a');
    link.href = `/posts/post.html?id=${post.id}`;
    link.classList.add('post-link');

    const postContainer = document.createElement('article');
    postContainer.classList.add('post-card');

    const img = document.createElement('img');
    img.classList.add('post-image');
    const fallbackUrl = 'https://via.placeholder.com/600x400?text=No+Image';

    const rawUrl = post?.media?.url || post?.image?.url || '';
    const safeUrl = normalizeMediaUrl(rawUrl);

    if (safeUrl) {
      img.src = safeUrl;
      img.onerror = () => {

        img.onerror = null;
        img.src = fallbackUrl;
      };
    } else {
      img.src = fallbackUrl;
    }

    img.alt = post?.media?.alt || post?.title || 'Post Image';
    img.referrerPolicy = 'no-referrer';
    img.loading = 'lazy';
    

    const title = document.createElement('h2');
    title.classList.add('post-title');
    title.textContent = (typeof post?.title === 'string' && post.title.trim() !== '') ? post.title : 'Untitled Post';

    const author = document.createElement('p');
    author.classList.add('post-author');
    const authorName = post?.author?.name || post?.author?.username || 'Unknown Author';
    author.textContent = `By ${authorName}`;

    postContainer.append(img, title, author);
    link.append(postContainer);
    displayContainer.append(link);
  }
}

async function main() {
  const posts = await fetchPosts();
  generatePosts(posts);
}

main();