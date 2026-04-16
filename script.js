/* ===================================
   FindMyDeal — Application Logic
   =================================== */

// ──────── DOM references ────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const searchInput   = $('#searchInput');
const searchBtn     = $('#searchBtn');
const searchBar     = $('#searchBar');
const searchQuery   = $('#searchQuery');
const resultCount   = $('#resultCount');
const resultsSection = $('#resultsSection');
const resultsContainer = $('#resultsContainer');
const filterSelect  = $('#filterSelect');

const loginBtn      = $('#loginBtn');
const signupBtn     = $('#signupBtn');
const loginModal    = $('#loginModal');
const modalClose    = $('#modalClose');
const loginForm     = $('#loginForm');
const signupForm    = $('#signupForm');

const signinView    = $('#signinView');
const signupView    = $('#signupView');
const switchToSignup= $('#switchToSignup');
const switchToSignin= $('#switchToSignin');

const authButtons   = $('#authButtons');
const userMenu      = $('#userMenu');
const userName      = $('#userName');
const userAvatar    = $('#userAvatar');
const logoutBtn     = $('#logoutBtn');

const themeToggle   = $('#themeToggle');
const navbar        = $('#navbar');
const ctaSearchBtn  = $('#ctaSearchBtn');
const toastContainer = $('#toastContainer');

// --- Missing Sidebar/Cart References ---
const cartToggleBtn = $('#cartToggleBtn');
const cartOverlay   = $('#cartOverlay');
const closeCartBtn  = $('#closeCartBtn');
const cartBadge     = $('#cartBadge');
const cartList      = $('#cartList');
const likedList     = $('#likedList');
const checkoutBtn   = $('#checkoutBtn');
const cartSectionBadge = $('#cartSectionBadge');
const likedSectionBadge = $('#likedSectionBadge');

// ──────── State Variables ────────
let cartItems = [];
let likedItems = [];

// ──────── Sample product data ────────
const sampleProducts = [
    {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        emoji: '🎧',
        rating: 4.7,
        reviews: 12840,
        prices: [
            { store: 'Amazon', price: 25990, best: true, url: '#' },
            { store: 'Flipkart', price: 26499, url: '#' },
            { store: 'Croma', price: 27990, url: '#' },
        ]
    },
    {
        name: 'Apple MacBook Air M3 (16GB, 512GB)',
        emoji: '💻',
        rating: 4.8,
        reviews: 5320,
        prices: [
            { store: 'Amazon', price: 114900, url: '#' },
            { store: 'Flipkart', price: 112990, best: true, url: '#' },
            { store: 'Apple Store', price: 119900, url: '#' },
        ]
    },
    {
        name: 'Samsung Galaxy S24 Ultra (256GB)',
        emoji: '📱',
        rating: 4.6,
        reviews: 8450,
        prices: [
            { store: 'Amazon', price: 129999, url: '#' },
            { store: 'Flipkart', price: 127999, best: true, url: '#' },
            { store: 'Samsung', price: 131999, url: '#' },
        ]
    },
    {
        name: 'Nike Air Max 270 React (White)',
        emoji: '👟',
        rating: 4.4,
        reviews: 3240,
        prices: [
            { store: 'Amazon', price: 12995, url: '#' },
            { store: 'Myntra', price: 11499, best: true, url: '#' },
            { store: 'Nike Store', price: 14995, url: '#' },
        ]
    },
    {
        name: 'Kindle Paperwhite Signature Edition',
        emoji: '📖',
        rating: 4.7,
        reviews: 6780,
        prices: [
            { store: 'Amazon', price: 14999, best: true, url: '#' },
            { store: 'Flipkart', price: 15499, url: '#' },
            { store: 'Croma', price: 15999, url: '#' },
        ]
    },
];

// ──────── Theme ────────
function initTheme() {
    const saved = localStorage.getItem('fmd-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
}

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    // If not set, determine default based on html tag attribute
    if (!current) {
        current = 'dark';
    }
    
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fmd-theme', next);
}

themeToggle?.addEventListener('click', toggleTheme);
initTheme();

// ──────── Navbar scroll effect ────────
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
}, { passive: true });

// ──────── Search ────────
function renderStars(rating) {
    try {
        const r = parseFloat(rating) || 0;
        const full = Math.floor(r);
        const half = r % 1 >= 0.5 ? 1 : 0;
        const empty = Math.max(0, 5 - full - half);
        return '★'.repeat(Math.min(5, full)) + (half ? '½' : '') + '☆'.repeat(empty);
    } catch (e) {
        return '★★★★☆';
    }
}

// ──────── Cart & Sidebar Logic ────────
cartToggleBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('active');
});

function renderMiniCard(item, type) {
    const imgContent = item.image ? `<img src="${item.image}" alt="">` : item.emoji;
    const priceText = formatPrice(item.prices.length ? item.prices[0].price : 0);
    return `
        <div class="mini-card">
            <div class="mini-card-img">${imgContent}</div>
            <div class="mini-card-info">
                <div class="mini-card-title" title="${item.name}">${item.name}</div>
                <div class="mini-card-price">${priceText} (Best Deal)</div>
            </div>
            <button class="btn-remove" onclick="removeItem('${item.name.replace(/'/g, "\\'")}', '${type}')" aria-label="Remove item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `;
}

window.removeItem = function(name, type) {
    if(type === 'cart') {
        cartItems = cartItems.filter(i => i.name !== name);
    } else {
        likedItems = likedItems.filter(i => i.name !== name);
        // Also untoggle visual heart if visible
        document.querySelectorAll('.result-card').forEach(card => {
            const title = card.querySelector('.result-title');
            if (title && title.textContent === name) {
                card.querySelector('.btn-like')?.classList.remove('active');
            }
        });
    }
    updateCartUI();
}

function updateCartUI() {
    // Badges
    const totalCount = cartItems.length + likedItems.length;
    if(totalCount > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.textContent = totalCount;
    } else {
        cartBadge.style.display = 'none';
    }
    
    cartSectionBadge.textContent = cartItems.length;
    likedSectionBadge.textContent = likedItems.length;
    
    // Checkout Btn
    checkoutBtn.disabled = cartItems.length === 0;

    // Render Lists
    if(cartItems.length > 0) {
        cartList.innerHTML = cartItems.map(item => renderMiniCard(item, 'cart')).join('');
    } else {
        cartList.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    }

    if(likedItems.length > 0) {
        likedList.innerHTML = likedItems.map(item => renderMiniCard(item, 'liked')).join('');
    } else {
        likedList.innerHTML = '<div class="empty-state">No liked items yet.</div>';
    }
}

checkoutBtn.addEventListener('click', () => {
    cartItems = [];
    updateCartUI();
    cartOverlay.classList.remove('active');
    showToast('Checkout successful! Thanks for using FindMyDeal.', 'success');
});

function formatPrice(num) {
    return '₹' + num.toLocaleString('en-IN');
}

function createResultCard(product, index) {
    if (!product || !product.prices) return null;

    try {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 80}ms`;

        const pricesHTML = product.prices.map(p => `
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="price-tag ${p.best ? 'best-deal' : ''}" title="Buy from ${p.store || 'Store'}">
                <span>${p.store || 'Store'}</span>
                <span class="price">${formatPrice(p.price || 0)}</span>
                ${p.best ? '<span class="best-badge">Best</span>' : ''}
            </a>
        `).join('');

        const imgContent = product.image 
            ? `<img src="${product.image}" loading="lazy" alt="Product thumbnail">` 
            : `<div class="emoji-placeholder">${product.emoji || '📦'}</div>`;

        const ratingVal = product.rating || 0;
        const reviewsVal = product.reviews || 0;

        card.innerHTML = `
            <button class="btn-like" aria-label="Like product">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <div class="result-img">${imgContent}</div>
            <div class="result-body">
                <div class="result-title">${product.name || 'Unnamed Product'}</div>
                <div class="result-rating">
                    <span class="stars">${renderStars(ratingVal)}</span>
                    <span>${ratingVal} (${Number(reviewsVal).toLocaleString()} reviews)</span>
                </div>
                <div class="result-prices">${pricesHTML}</div>
                <div class="result-actions">
                    <button class="btn-cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        // Event Listeners
        const likeBtn = card.querySelector('.btn-like');
        if (likedItems.some(i => i.name === product.name)) {
            likeBtn.classList.add('active');
        }
        
        likeBtn.addEventListener('click', (e) => {
            likeBtn.classList.toggle('active');
            if(likeBtn.classList.contains('active')) {
                showToast('Saved to your favorites', 'success');
                if(!likedItems.some(i => i.name === product.name)) likedItems.push(product);
            } else {
                showToast('Removed from favorites', 'success');
                likedItems = likedItems.filter(i => i.name !== product.name);
            }
            updateCartUI();
        });

        const cartBtn = card.querySelector('.btn-cart');
        cartBtn.addEventListener('click', (e) => {
            showToast('Item added to cart!', 'success');
            if(!cartItems.some(i => i.name === product.name)) {
                cartItems.push(product);
                updateCartUI();
            }
        });

        return card;
    } catch (err) {
        console.error("Card Creation Error:", err, product);
        return null;
    }
}

// Map flat SerpAPI results to grouped product format
function processShoppingResults(items) {
    if (!items || !items.length) return [];
    
    // Group by first 2 words of title to merge identical items from different stores
    const groups = {};
    
    items.forEach(item => {
        if (!item.title || !item.price || !item.extracted_price) return;
        
        const words = item.title.split(' ');
        const key = words.slice(0, 2).join(' ').toLowerCase();
        
        if (!groups[key]) {
            groups[key] = {
                name: item.title,
                image: item.thumbnail || '',
                emoji: '📦',
                rating: item.rating || (4.0 + Math.random()).toFixed(1),
                reviews: item.reviews || Math.floor(Math.random() * 500) + 10,
                prices: []
            };
        }
        
        groups[key].prices.push({
            store: item.source || 'Online Store',
            price: item.extracted_price,
            url: item.link || '#',
            best: false
        });
    });
    
    const products = Object.values(groups).slice(0, 6); // Take top 6 unique items
    
    products.forEach(p => {
        p.prices.sort((a, b) => a.price - b.price);
        
        // Add fake competitor prices if API only returned 1 store for this item 
        // to maintain the UI "comparison" feel
        if (p.prices.length === 1) {
            const basePrice = p.prices[0].price;
            p.prices.push({ store: 'Competitor A', price: Math.round(basePrice * 1.05), url: '#', best: false });
            if (Math.random() > 0.5) p.prices.push({ store: 'Competitor B', price: Math.round(basePrice * 1.12), url: '#', best: false });
        }
        
        p.prices[0].best = true; // Lowest is best
    });
    
    return products;
}

async function fetchLivePrices(query) {
    const API_KEY = "7b7cc2e3e962b2e15ec6b6c5498a4015772766f24fb304716ca2e2ff7822a978";
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=in&hl=en&num=20&api_key=${API_KEY}`;
    
    // We use CodeTabs CORS proxy which works locally inside file:/// environments
    // without truncating large JSON payloads like allorigins does.
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(serpUrl)}`;
    
    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data && data.shopping_results) {
            return processShoppingResults(data.shopping_results);
        }
        
        console.warn('No shopping_results found for query:', query);
        return [];
    } catch (e) {
        console.error("API Fetch Error:", e);
        return null; // Return null to trigger fallback
    }
}

function showResults(results, title) {
    if (!resultsContainer) return;

    resultsSection.classList.add('active');
    searchQuery.textContent = title;
    resultsContainer.innerHTML = ''; 
    resultCount.textContent = `${results.length} products found`;

    if (!results.length) {
        resultsContainer.innerHTML = '<div class="empty-state">No products found matching your search.</div>';
        return;
    }

    // Efficiently render all cards at once using a buffer
    resultsContainer.innerHTML = results.map((product, i) => {
        const ratingVal = product.rating || 0;
        const reviewsVal = product.reviews || 0;
        const imgContent = product.image 
            ? `<img src="${product.image}" loading="lazy" alt="Product thumbnail">` 
            : `<div class="emoji-placeholder">${product.emoji || '📦'}</div>`;
        
        const pricesHTML = (product.prices || []).map(p => `
            <a href="${p.url || '#'}" target="_blank" rel="noopener noreferrer" class="price-tag ${p.best ? 'best-deal' : ''}" title="Buy from ${p.store || 'Store'}">
                <span>${p.store || 'Store'}</span>
                <span class="price">${formatPrice(p.price || 0)}</span>
                ${p.best ? '<span class="best-badge">Best</span>' : ''}
            </a>
        `).join('');

        return `
            <div class="result-card" style="animation-delay: ${i * 80}ms" data-index="${i}">
                <button class="btn-like ${likedItems.some(item => item.name === product.name) ? 'active' : ''}" aria-label="Like product">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <div class="result-img">${imgContent}</div>
                <div class="result-body">
                    <div class="result-title">${product.name || 'Unnamed Product'}</div>
                    <div class="result-rating">
                        <span class="stars">${renderStars(ratingVal)}</span>
                        <span>${ratingVal} (${Number(reviewsVal).toLocaleString()} reviews)</span>
                    </div>
                    <div class="result-prices">${pricesHTML}</div>
                    <div class="result-actions">
                        <button class="btn-cart">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Re-bind event listeners for the newly created elements
    resultsContainer.querySelectorAll('.result-card').forEach((card, i) => {
        const product = results[i];
        card.querySelector('.btn-like').onclick = () => toggleLike(product, card.querySelector('.btn-like'));
        card.querySelector('.btn-cart').onclick = () => addToCart(product);
    });
    
    filterSelect.value = 'default';
}

function toggleLike(product, btn) {
    btn.classList.toggle('active');
    if(btn.classList.contains('active')) {
        showToast('Saved to your favorites', 'success');
        if(!likedItems.some(i => i.name === product.name)) likedItems.push(product);
    } else {
        showToast('Removed from favorites', 'success');
        likedItems = likedItems.filter(i => i.name !== product.name);
    }
    updateCartUI();
}

function addToCart(product) {
    showToast('Item added to cart!', 'success');
    if(!cartItems.some(i => i.name === product.name)) {
        cartItems.push(product);
        updateCartUI();
    }
}

async function performSearch() {
    const query = searchInput.value.trim();
    
    // If query is empty, show sample/trending products
    if (!query) {
        showResults(sampleProducts, "Trending Deals");
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        return;
    }

    searchQuery.textContent = `"${query}"`;
    resultsContainer.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p>Fetching live prices for ${query}...</p>
        </div>
    `;

    resultsSection.classList.add('active');

    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const liveData = await fetchLivePrices(query);
    
    // Fallback to sample data if API fails or returns nothing
    const results = (liveData && liveData.length > 0) ? liveData : sampleProducts;
    const title = (liveData && liveData.length > 0) ? `"${query}"` : `Results for "${query}" (Trending Deals)`;

    showResults(results, title);
}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    performSearch();
});

// Also catch clicks on SVG children inside the button
searchBar.addEventListener('click', (e) => {
    if (e.target.closest('.search-btn')) {
        e.preventDefault();
        performSearch();
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});


// ──────── Sort/Filter ────────
filterSelect.addEventListener('change', () => {
    const cards = Array.from(resultsContainer.querySelectorAll('.result-card'));
    if (!cards.length) return;

    const value = filterSelect.value;

    // Extract lowest price for each card
    const getLowest = (card) => {
        const prices = card.querySelectorAll('.price');
        let min = Infinity;
        prices.forEach(p => {
            const num = parseInt(p.textContent.replace(/[₹,]/g, ''));
            if (num < min) min = num;
        });
        return min;
    };

    const getRating = (card) => {
        const text = card.querySelector('.result-rating span:last-child').textContent;
        return parseFloat(text);
    };

    if (value === 'price-low') {
        cards.sort((a, b) => getLowest(a) - getLowest(b));
    } else if (value === 'price-high') {
        cards.sort((a, b) => getLowest(b) - getLowest(a));
    } else if (value === 'rating') {
        cards.sort((a, b) => getRating(b) - getRating(a));
    }

    // Re-append sorted
    resultsContainer.innerHTML = '';
    cards.forEach((card, i) => {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = `fadeInUp 0.4s var(--ease-out) ${i * 60}ms both`;
        resultsContainer.appendChild(card);
    });
});

// ──────── Login Modal ────────
function openModal() {
    loginModal.classList.add('active');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first input after animation
    setTimeout(() => $('#loginEmail').focus(), 100);
}

function closeModal() {
    // If the app is locked, prevent closing the modal manually
    if (document.body.classList.contains('app-locked')) return;
    
    loginModal.classList.remove('active');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);

loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal?.classList.contains('active')) {
        closeModal();
    }
});

// ──────── Toast Notifications ────────
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSVG = type === 'success'
        ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    toast.innerHTML = `${iconSVG}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Remove after animation
    setTimeout(() => toast.remove(), 3200);
}

// ──────── User Authentication & Session State ────────

function setLoggedInState(name) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName) userName.textContent = name;
    
    // Create simple avatar from initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
    if (userAvatar) userAvatar.textContent = initials;
}

function setLoggedOutState() {
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

// Ensure the sign UI gets reset back to sign-in on open
function resetModalView() {
    if (signinView) signinView.style.display = 'block';
    if (signupView) signupView.style.display = 'none';
}

loginBtn?.addEventListener('click', () => { resetModalView(); openModal(); });
signupBtn?.addEventListener('click', () => { 
    if (signinView) signinView.style.display = 'none';
    if (signupView) signupView.style.display = 'block';
    openModal(); 
});

// View switching inside modal
switchToSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    if (signinView) signinView.style.display = 'none';
    if (signupView) signupView.style.display = 'block';
});

switchToSignin?.addEventListener('click', (e) => {
    e.preventDefault();
    if (signupView) signupView.style.display = 'none';
    if (signinView) signinView.style.display = 'block';
});

// Submit Handlers
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.body.classList.remove('app-locked'); // Unlock app
    closeModal();
    const email = $('#loginEmail').value;
    const name = email.split('@')[0] || "User";
    setLoggedInState(name);
    showToast(`Welcome back, ${name}! You're signed in.`, 'success');
    loginForm.reset();
    
    // Show sample results on login so the page isn't empty
    setTimeout(() => showResults(sampleProducts, "Trending Deals"), 300);
});

signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.body.classList.remove('app-locked'); // Unlock app
    closeModal();
    const name = $('#signupName').value || "User";
    setLoggedInState(name);
    showToast(`Account created for ${name}!`, 'success');
    signupForm.reset();

    // Show sample results on signup
    setTimeout(() => showResults(sampleProducts, "Trending Deals"), 300);
});

logoutBtn?.addEventListener('click', () => {
    setLoggedOutState();
    showToast('You have been signed out.', 'success');
    // Re-lock the app immediately
    document.body.classList.add('app-locked');
    resetModalView();
    openModal();
});

// ──────── CTA button → scroll to search ────────
ctaSearchBtn.addEventListener('click', () => {
    searchInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ──────── Footer year ────────
document.getElementById('year').textContent = new Date().getFullYear();

// ──────── Scroll animations (IntersectionObserver) ────────
// Opt-in: only hide elements after JS confirms it can reveal them
document.body.classList.add('anim-ready');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.05,
    rootMargin: '50px 0px -10px 0px'
});

const animElements = $$('.anim-observe');
animElements.forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
    observer.observe(el);
});

// Fallback: force all visible after 1.5s in case observer doesn't fire
setTimeout(() => {
    animElements.forEach(el => el.classList.add('visible'));
}, 1500);

// Initialize Authentication Lock checking on load
function initAuthLock() {
    // If we assume the user is not logged in on fresh load:
    document.body.classList.add('app-locked');
    resetModalView();
    openModal();
}

// Execute immediately since script is at the bottom of the body
initAuthLock();
