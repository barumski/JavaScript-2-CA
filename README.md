# JavaScript-2-CA

This project id my delivery for the JavaScript 2 Course Assignment at Noroff.
It is a small social media client that connects to the Noroff social API and allows a registered user to log in, 
create posts and interact with content

## Features

- **Authentication**
    - Register new user
    - Log in and store `accessToken` in `localStorage`
    - Log out and clear relevant auth data

- **Feed**
    - View a list of the latest posts in responsive grid
    - Each card shows title, author and image
    - Click a post to view the full singe post page
    - Search posts by title and author (client-side filtering)
    - Filter between:
        - **All Posts**
        - **For You** (posts from profiles you follow)

- **Single Post**
    - View full post with large image, title, author and body
    - If you are the **owner**:
        - Edit the post
        - Delete the post
    - If you are **not the owner**:
        - Follow / unfollow the post author

- **Profile**
    - View your own profile data from the API
    - Display avatar, name (email) and bio
    - Show counts for:
        - Posts
        - Followers
        - Following
    - List your own posts in a separate "My posts" grid

- **Author page**
    - Click an author name to see a page with all posts from that profile
    - Shows created/updated dates and a card grid similar to the main feed

## Tech stack

- **HTML5**
- **CSS**
    - Custom layout
    - Responsive design
- **JavaScript (ES6 modules)**
    - `import` / `export`
    - Multiple small modules for API, auth, search, UI
- **Noroff Social API v2**
    - `https://v2.api.noroff.dev`

## Project structure (simplified)

root
├─ login.html               # Login page
├─ account/
│  ├─ profile.html          # "My profile" page
│  └─ register.html         # Registration page
├─ css/
│  ├─ variables.css         # All global variables (colors, fonts, sizes)
│  ├─ header_footer.css     # Shared header & footer styling
│  ├─ post.css              # Styling for single post page
│  ├─ post-actions.css      # Styling for edit/delete buttons
│  ├─ profile.css           # Styling for profile page
│  ├─ author.css            # Styling for author page (all posts by user)
│  ├─ feed.css              # Styling for feed grid, buttons, and search bar
│  └─ login_register.css    # Shared styles for login and registration
├─ posts/
│  ├─ author.html           # Shows all posts by a specific user
│  ├─ create.html           # Create new post
│  ├─ edot.html             # Edit an existing post
│  ├─ feed.html             # Main feed with all posts
│  └─ post.html             # Single post view
└─ scripts/
   ├─ api/
   │  └─ api.mjs          # BASE_API_URL, endpoints, and API key
   ├─ auth/
   │  ├─ login.mjs        # Log in user, stores token & username
   │  ├─ logout.mjs       # Reusable logout function
   │  └─ register.mjs     # Handles registration form
   ├─ posts/
   │  ├─ create.mjs       # Create post logic
   │  ├─ delete.mjs       # Delete endpoint for posts
   │  ├─ edit.mjs         # Load post data & update post
   │  └─ post.mjs         # Single post page (edit/delete/follow logic)
   ├─ search/
   │  └─ search.mjs       # Search bar: search by title or author
   ├─ feed.mjs            # Fetch & render main feed & filters
   ├─ ui.mjs              # Small reusable UI helpers
   ├─ author.mjs          # Fetch & render posts by a specific author
   ├─ profile.mjs         # Fetch & render logged-in user's profile & posts
   └─ utilities.mjs       # LocalStorage helpers & generic utilities

