import { NOROFF_API_KEY, POSTS_URL, PROFILES_URL } from '../api/api.mjs';
import { getFromLocalStorage } from '../utilities.mjs';
import { logoutUser } from '../auth/logout.mjs';
import { setupPostSearch } from '../search/search.mjs';

let allPosts = [];
let followingProfiles = [];

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

/**
 * Fetches a list of social posts from the Noroff API.
 * 
 * Adds the authenticated user's access token and API key as headers.
 * 
 * @async 
 * @returns {Promise<Object[]} Resolves th an array of post objects.
 * Returns an empty array if the request fails or the user is not authenticated. 
 */

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

async function fetchFollowingProfiles() {
  if (!currentUser) {
    console.warn('No currentUser found, cannot fetch following');
    return [];
  }


  try {
    const response = await fetch(
      `${PROFILES_URL}/${encodeURIComponent(currentUser)}?_following=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Noroff-API-Key': NOROFF_API_KEY,
        },
      }
    );

        const json = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch following profiles:', json);
      return [];
    }
    return json.data?.following || [];
  } catch (error) {
    console.error('Error fetching following profiles:', error);
    return [];
  }
}

function filterPostsForYou(posts, followingProfiles) {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  if (!Array.isArray(followingProfiles) || followingProfiles.length === 0) return [];

    const followedNames = new Set(
    followingProfiles
      .map((profile) => profile.name || profile.username)
      .filter(Boolean)
  );

    return posts.filter((post) => {
    const authorName = post?.author?.name || post?.author?.username;
    if (!authorName) return false;
    return followedNames.has(authorName);
  });
}

/**
 * Renders a list of posts into the feed grid container.
 * 
 * Each post is turned into a clickable card that links to the single post page.
 * 
 * @param {Object[]} [posts=[]] - Array of post objects returned from the API.
 * @param {*} posts[].id - Unique id of the post. 
 * @param {*} [posts[].title] - Title of the post. 
 * @param {*} [posts[].media] - Optional media object with url/alt.
 * @param {*} [posts[].author] - Optional author object with name/username.   
 */

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

function setupFilterButtons() {
  const allPostsBtn = document.getElementById('allPostsBtn');
  const forYouBtn = document.getElementById('forYouBtn');

  if (!allPostsBtn || !forYouBtn) {
    console.warn('Filter buttons not found in DOM');
    return;
  }

  const setActive = (activeBtn) => {
    allPostsBtn.classList.remove('active');
    forYouBtn.classList.remove('active');
    activeBtn.classList.add('active');
  };

  allPostsBtn.addEventListener('click', () => {
    setActive(allPostsBtn);
    generatePosts(allPosts);
  });

  forYouBtn.addEventListener('click', () => {
    setActive(forYouBtn);

    const forYouPosts = filterPostsForYou(allPosts, followingProfiles);

    if (!forYouPosts.length) {
      displayContainer.textContent =
        'No posts from profiles you follow yet.';
      return;
    }

    generatePosts(forYouPosts);
  });
}

async function main() {
  const [posts, following] = await Promise.all([
    fetchPosts(),
    fetchFollowingProfiles(),
  ]);

  allPosts = posts || [];
  followingProfiles = following || [];


  generatePosts(allPosts);

  setupPostSearch('#searchInput', allPosts, (filteredPosts) => {
    generatePosts(filteredPosts);
  });


  setupFilterButtons();
}

main();