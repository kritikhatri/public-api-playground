/**
 * Public API Playground Logic
 * Demonstrates consuming various APIs with vanilla JavaScript
 */

// ==========================================
// UTILS & UI CONTROLS
// ==========================================

/**
 * Returns HTML string for a loading spinner
 * @returns {string} HTML string
 */
const getSpinnerHtml = () => `
    <div class="spinner-container fade-in" style="width: 100%">
        <div class="spinner"></div>
    </div>
`;

/**
 * Returns HTML string for an error message
 * @param {string} msg - The error message to display
 * @returns {string} HTML string
 */
const getErrorHtml = (msg) => `
    <div class="error-message fade-in">
        ${msg}
    </div>
`;

/**
 * Displays a toast notification on the screen
 * @param {string} message - Text to display in the toast
 */
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        // Wait for animation to finish before removing element
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// ==========================================
// THEME MANAGEMENT (DARK MODE)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Check for saved theme in localStorage, or rely on system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply dark mode initially if needed
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
}

// Toggle logic
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'light';
    
    if (currentTheme !== 'dark') {
        newTheme = 'dark';
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Save preference
});


// ==========================================
// API 1: DOG FINDER
// ==========================================
const dogContent = document.getElementById('dog-content');
const btnDog = document.getElementById('btn-dog');
const btnCopyDog = document.getElementById('btn-copy-dog');
let currentDogUrl = ''; // Keep track of the current image to copy

/**
 * Formats a dog breed string nicely (e.g. from URL parts)
 * URL often looks like: .../breeds/hound-afghan/... 
 * We want: "Afghan Hound"
 * @param {string} breedStr 
 * @returns {string} Capitalized and formatted breed
 */
function formatBreedName(breedStr) {
    if (!breedStr) return 'Unknown Breed';
    return breedStr
        .split('-')
        .reverse() // Subbreed comes after, flip it back
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function fetchDog() {
    try {
        // 1. Show loading state & disable actions
        dogContent.innerHTML = getSpinnerHtml();
        btnCopyDog.classList.add('hidden');
        btnDog.disabled = true;

        // 2. Fetch data
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data.status === 'success') {
            currentDogUrl = data.message;
            
            // Extract breed from URL string
            // Example message: https://images.dog.ceo/breeds/terrier-irish/n02093991_1067.jpg
            const urlParts = currentDogUrl.split('/');
            const breedIndex = urlParts.indexOf('breeds') + 1;
            const breedRaw = breedIndex > 0 ? urlParts[breedIndex] : 'unknown';
            const breedName = formatBreedName(breedRaw);

            // 3. Render success state
            dogContent.innerHTML = `
                <div class="fade-in" style="width: 100%">
                    <div class="img-container">
                        <img src="${currentDogUrl}" alt="A random dog" class="dog-img">
                    </div>
                    <div class="dog-breed">${breedName}</div>
                </div>
            `;
            btnCopyDog.classList.remove('hidden');
        } else {
            throw new Error('API returned an error object');
        }
    } catch (error) {
        dogContent.innerHTML = getErrorHtml('Failed to fetch a dog. Please try again!');
        console.error('Dog fetch error:', error);
    } finally {
        // 4. Re-enable actions
        btnDog.disabled = false;
    }
}

// Event Listeners for Dog Card
btnDog.addEventListener('click', fetchDog);
btnCopyDog.addEventListener('click', async () => {
    if (!currentDogUrl) return;
    try {
        await navigator.clipboard.writeText(currentDogUrl);
        showToast('Image URL copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy URL');
        console.error('Copy error:', err);
    }
});


// ==========================================
// API 2: JOKE GENERATOR
// ==========================================
const jokeContent = document.getElementById('joke-content');
const btnJoke = document.getElementById('btn-joke');

async function fetchJoke() {
    try {
        btnJoke.textContent = 'Loading...';
        btnJoke.disabled = true;
        jokeContent.innerHTML = getSpinnerHtml();

        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        
        // Render joke
        jokeContent.innerHTML = `
            <div class="fade-in" style="width: 100%">
                <div class="joke-setup">${data.setup}</div>
                <div class="joke-punchline">${data.punchline}</div>
            </div>
        `;
        
        btnJoke.textContent = 'Next Joke';
    } catch (error) {
        jokeContent.innerHTML = getErrorHtml('Failed to fetch a joke. The joke is on us!');
        console.error('Joke fetch error:', error);
        btnJoke.textContent = 'Try Again';
    } finally {
        btnJoke.disabled = false;
    }
}

btnJoke.addEventListener('click', fetchJoke);


// ==========================================
// API 3: RANDOM USER PROFILE
// ==========================================
const userContent = document.getElementById('user-content');
const btnUser = document.getElementById('btn-user');

async function fetchUser() {
    try {
        userContent.innerHTML = getSpinnerHtml();
        btnUser.disabled = true;

        const response = await fetch('https://randomuser.me/api/');
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const user = data.results[0]; // The API returns an array under 'results'
        
        const fullName = `${user.name.first} ${user.name.last}`;
        
        // Render user
        userContent.innerHTML = `
            <div class="user-profile fade-in" style="width: 100%">
                <img src="${user.picture.large}" alt="${fullName}" class="user-img">
                <div class="user-info">
                    <div class="user-name">${fullName}</div>
                    <div class="user-detail">📧 ${user.email}</div>
                    <div class="user-detail">🌍 ${user.location.country}</div>
                    <div class="user-detail">🎂 Age: ${user.dob.age}</div>
                    <div class="user-detail">📱 ${user.phone}</div>
                </div>
            </div>
        `;
    } catch (error) {
        userContent.innerHTML = getErrorHtml('Could not load user profile. Try again.');
        console.error('User fetch error:', error);
    } finally {
        btnUser.disabled = false;
    }
}

btnUser.addEventListener('click', fetchUser);


// ==========================================
// API 4: POSTS EXPLORER
// ==========================================
const postsContent = document.getElementById('posts-content');
const btnPosts = document.getElementById('btn-posts');

async function fetchPosts() {
    try {
        postsContent.innerHTML = getSpinnerHtml();
        btnPosts.disabled = true;

        // Fetch exactly 5 posts using query parameters
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) throw new Error('Network error');
        
        const posts = await response.json();
        
        // Build list HTML
        let postsHtml = '<ul class="post-list fade-in" style="width: 100%">';
        
        posts.forEach(post => {
            // Capitalize first character of the title for better aesthetics
            const title = post.title.charAt(0).toUpperCase() + post.title.slice(1);
            
            // Accordion style item
            postsHtml += `
                <li class="post-item">
                    <div class="post-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <span>${title}</span>
                        <svg class="post-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    <div class="post-body">
                        ${post.body}
                    </div>
                </li>
            `;
        });
        
        postsHtml += '</ul>';
        postsContent.innerHTML = postsHtml;
        
        btnPosts.textContent = 'Reload Posts';
    } catch (error) {
        postsContent.innerHTML = getErrorHtml('Failed to fetch posts. Server might be busy.');
        console.error('Posts fetch error:', error);
        btnPosts.textContent = 'Try Again';
    } finally {
        btnPosts.disabled = false;
    }
}

btnPosts.addEventListener('click', fetchPosts);
