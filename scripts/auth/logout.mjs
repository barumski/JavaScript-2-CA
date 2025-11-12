export function logoutUser({
    selector = '#logout',
    redirectPath = '../login.html',
    clearAll = false,
} = {}) {
    const logoutLink = document.querySelector(selector);

    if (!logoutLink) {
        console.warn(`Logout link not found for selector: ${selector}`);
        return; 
    }

    logoutLink.addEventListener('click', (event) => {
        event.preventDefault();

        if (clearAll) {
            localStorage.clear();
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
        }

        console.log('User logged out successfully.');
        window.location.href = redirectPath;
    });
}





















