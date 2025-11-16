import { PROFILES_URL, NOROFF_API_KEY } from './api/api.mjs';
import { getFromLocalStorage } from './utilities.mjs';
import { logoutUser } from './auth/logout.mjs';
import { setupPostSearch } from './search/search.mjs';

setupPostSearch('#searchInput', [], () => {});

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

const avatarEl = document.getElementById('profileAvatar');
const nameEl = document.getElementById('profileName');
const emailEl = document.getElementById('profileEmail');
const bioEl = document.getElementById('profileBio');
const postsCountEl = document.getElementById('profilePostsCount');
const followersCountEl = document.getElementById('profileFollowersCount');
const followingCountEl = document.getElementById('profileFollowingCount');
const postsContainer = document.getElementById('profilePostsContainer');

async function fetchMyProfile() {
    if (!currentUser) {
        console.warn('No userName found in localStorage');
        return null;
    }

    try {
        const url = `${PROFILES_URL}/${encodeURIComponent(currentUser)}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY,
            },
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch profile', json);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userName');
                window.location.href = '../login.html';
            }

            return null;
        }

        return json.data;
    }    catch (error) {
        console.error('Error fetching profile', error);
        return null;
    }
}

async function fetchMyPosts() {
    if (!currentUser) return [];

    try {
        const url = `${PROFILES_URL}/${encodeURIComponent(currentUser)}/posts`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': NOROFF_API_KEY,
            },
        });

        const json = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch my posts', json);
            return [];
        }

        return json.data || [];
    }   catch (error) {
        console.error('Error fetching my posts:', error);
        return [];
    }
}

function renderProfile(profile) {
    if (!profile) {
        if (nameEl) nameEl.textContent = 'Profile not found';
        return;
    }

    if (avatarEl) {
        avatarEl.src = profile.avatar?.url || 'https://via.placeholder.com/150x150?text=No+Avatar';
        avatarEl.alt = profile.avatar?.alt || profile.name || 'Profile avatar'
    }

    if (nameEl) {
        nameEl.textContent = profile.name || currentUser || 'Unknown user';
    }

    if (emailEl) {
        emailEl.textContent = profile.email || '';
    }

    if (bioEl) {
        bioEl.textContent = profile.bio || 'No bio yet.';
    }

    const postsCount = profile._count?.posts ?? 0;
    const followersCount = profile._count?.followers ?? 0;
    const followingCount = profile._count?.following ?? 0;

    if (postsCountEl) {
        postsCountEl.textContent = `Posts: ${postsCount}`;
    }

    if (followersCountEl) {
        followersCountEl.textContent = `Followers: ${followersCount}`;
    }

    if (followingCountEl) {
        followingCountEl.textContent = `Following: ${followingCount}`;
    }
}


function renderProfilePosts(posts = []) {
    if (!postsContainer) return;
    
    postsContainer.textContent = '';
    
    if (!Array.isArray(posts) || posts.length === 0) {
        postsContainer.textContent = 'No posts yet.';
        return;     
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        const link = document.createElement('a');
        link.href = `../posts/post.html?id=${post.id}`;
        link.classList.add('post-link');

        const card = document.createElement('article');
        card.classList.add('post-card');

        const img = document.createElement('img');
        img.classList.add('post-image');
        img.src = post.media?.url || 'https://via.placeholder.com/600x400?text=No+Image';
        img.alt = post.media?.alt || post.title || 'Post image';

        const title = document.createElement('h3');
        title.classList.add('post-title');
        title.textContent = post.title || 'Untitled Post';

        card.append(img, title);
        link.append(card);
        postsContainer.append(link);
    }
}

async function main() {
    const profile = await fetchMyProfile();
    renderProfile(profile);

    const myPosts = await fetchMyPosts();
    renderProfilePosts(myPosts);
}

main();
