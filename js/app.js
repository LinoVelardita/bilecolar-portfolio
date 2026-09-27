/* ==========================================================================
   BILECOLAR PORTFOLIO - APPLICATION CONTROLLER & ROUTER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State Store
    const AppState = {
        allWorks: [],
        bioData: null,
        currentSection: 'home',
        currentWorksTab: 'all'
    };

    // DOM Elements
    const views = {
        home: document.getElementById('view-home'),
        about: document.getElementById('view-about'),
        works: document.getElementById('view-works'),
        contacts: document.getElementById('view-contacts')
    };

    const worksOverlay = document.getElementById('works-overlay');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const bgVideo = document.getElementById('bg-video');

    /* --------------------------------------------------------------------------
       1. ROUTING & NAVIGATION
       -------------------------------------------------------------------------- */
    function handleRouteChange() {
        const hash = window.location.hash.replace('#', '') || 'home';
        const parts = hash.split('/');
        const mainRoute = parts[0];
        const subRoute = parts[1] || 'all';

        // Close overlays on navigation
        closeAllOverlays();

        // Handle views
        Object.keys(views).forEach(key => {
            if (views[key]) {
                if (key === mainRoute) {
                    views[key].classList.add('active-view');
                } else {
                    views[key].classList.remove('active-view');
                }
            }
        });

        AppState.currentSection = mainRoute;

        // Toggle homepage video background visibility / blend mode style
        if (mainRoute === 'home') {
            document.body.classList.add('is-homepage');
        } else {
            document.body.classList.remove('is-homepage');
        }

        // Works section tab switching
        if (mainRoute === 'works') {
            switchWorksTab(subRoute);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', handleRouteChange);

    /* --------------------------------------------------------------------------
       2. OVERLAY CONTROLLER (Works & Mobile Hamburger Menu)
       -------------------------------------------------------------------------- */
    function openWorksOverlay() {
        mobileMenuOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        worksOverlay.classList.add('active');
    }

    function openMobileMenuOverlay() {
        worksOverlay.classList.remove('active');
        mobileMenuOverlay.classList.add('active');
        hamburgerBtn.classList.add('active');
    }

    function closeAllOverlays() {
        worksOverlay.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        searchModal.classList.remove('active');
    }

    // Hamburger Button click
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            if (mobileMenuOverlay.classList.contains('active') || worksOverlay.classList.contains('active')) {
                closeAllOverlays();
            } else {
                openMobileMenuOverlay();
            }
        });
    }

    // Works overlay trigger links
    document.querySelectorAll('[data-trigger="works-overlay"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openWorksOverlay();
        });
    });

    // Back buttons inside overlays
    document.querySelectorAll('[data-action="close-overlay"]').forEach(btn => {
        btn.addEventListener('click', closeAllOverlays);
    });

    document.querySelectorAll('[data-action="back-to-menu"]').forEach(btn => {
        btn.addEventListener('click', openMobileMenuOverlay);
    });

    /* --------------------------------------------------------------------------
       3. DATA LOADING & RENDERING
       -------------------------------------------------------------------------- */
    async function initData() {
        // Fetch Homepage Settings
        const settings = await window.SanityClient.getHomepageSettings();
        if (settings && settings.videoUrl && bgVideo) {
            bgVideo.src = settings.videoUrl;
        }

        // Fetch Bio
        AppState.bioData = await window.SanityClient.getBio();
        renderBio(AppState.bioData);

        // Fetch Works
        AppState.allWorks = await window.SanityClient.getWorks();
        renderWorksList(AppState.allWorks);

        // Initial Route Trigger
        handleRouteChange();
    }

    function renderBio(bio) {
        const bioTextEl = document.getElementById('bio-text-container');
        const bioImgEl = document.getElementById('bio-img');

        if (bioTextEl && bio) {
            bioTextEl.innerHTML = `<p class="about-bio-paragraph">${bio.text}</p>`;
        }
        if (bioImgEl && bio && bio.imageUrl) {
            bioImgEl.src = bio.imageUrl;
            bioImgEl.alt = bio.title || 'Bilecolar Bio Photo';
        }
    }

    function renderWorksList(works) {
        const worksGrid = document.getElementById('works-grid');
        if (!worksGrid) return;

        worksGrid.innerHTML = '';

        if (!works || works.length === 0) {
            worksGrid.innerHTML = '<p class="search-no-results">Nessun progetto disponibile.</p>';
            return;
        }

        works.forEach(work => {
            const card = document.createElement('div');
            card.className = 'work-card';
            card.dataset.section = (work.section || '').toLowerCase();

            card.innerHTML = `
                <div class="work-cover-wrapper">
                    <img src="${work.coverUrl || 'asset/pics/Brassage.jpg'}" alt="${work.title}" class="work-cover-img" loading="lazy">
                </div>
                <div class="work-details">
                    <span class="work-section-tag">${work.section || 'Work'}</span>
                    <h3 class="work-title">${work.title}</h3>
                    <p class="work-description">${work.description || ''}</p>
                    ${work.link ? `<a href="${work.link}" target="_blank" rel="noopener" class="work-link">Ascolta / Vedi Project →</a>` : ''}
                </div>
            `;

            worksGrid.appendChild(card);
        });
    }

    function switchWorksTab(tabName) {
        const tabs = document.querySelectorAll('.works-tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.tab.toLowerCase() === tabName.toLowerCase()) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            if (tabName === 'all' || card.dataset.section === tabName.toLowerCase()) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        AppState.currentWorksTab = tabName;
    }

    // Works tab clicks
    document.querySelectorAll('.works-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            window.location.hash = `#works/${tab.toLowerCase()}`;
        });
    });

    /* --------------------------------------------------------------------------
       4. SEARCH WITH AUTOCOMPLETE
       -------------------------------------------------------------------------- */
    const searchTriggerBtn = document.getElementById('search-trigger-btn');
    const searchCloseBtn = document.getElementById('search-close-btn');

    if (searchTriggerBtn) {
        searchTriggerBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            setTimeout(() => searchInput.focus(), 150);
        });
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query);
        });
    }

    function performSearch(query) {
        if (!searchResults) return;

        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const matches = [];

        // Search Bio
        if (AppState.bioData && AppState.bioData.text) {
            if (AppState.bioData.text.toLowerCase().includes(query) || 'about bio biografia'.includes(query)) {
                matches.push({
                    title: 'Bio / About',
                    snippet: AppState.bioData.text.substring(0, 110) + '...',
                    badge: 'Bio',
                    hash: '#about'
                });
            }
        }

        // Search Works
        AppState.allWorks.forEach(work => {
            const titleMatch = (work.title || '').toLowerCase().includes(query);
            const descMatch = (work.description || '').toLowerCase().includes(query);
            const secMatch = (work.section || '').toLowerCase().includes(query);

            if (titleMatch || descMatch || secMatch) {
                matches.push({
                    title: work.title,
                    snippet: work.description ? work.description.substring(0, 90) + '...' : '',
                    badge: work.section || 'Work',
                    hash: `#works/${(work.section || 'all').toLowerCase()}`
                });
            }
        });

        // Render Results
        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">Nessun risultato trovato</div>';
            return;
        }

        searchResults.innerHTML = matches.map(match => `
            <div class="search-result-item" data-hash="${match.hash}">
                <div>
                    <div class="search-result-title">${match.title}</div>
                    <div class="search-result-snippet">${match.snippet}</div>
                </div>
                <span class="search-result-badge">${match.badge}</span>
            </div>
        `).join('');

        // Result Item Click
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const targetHash = item.dataset.hash;
                searchModal.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
                window.location.hash = targetHash;
            });
        });
    }

    /* --------------------------------------------------------------------------
       5. CONTACT FORM SUBMISSION
       -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-btn');
            if (submitBtn) submitBtn.disabled = true;

            if (formStatus) {
                formStatus.style.display = 'block';
                formStatus.textContent = 'Invio messaggio in corso...';
            }

            // Simulate submission
            setTimeout(() => {
                if (formStatus) {
                    formStatus.textContent = '✓ Grazie! Il tuo messaggio è stato inviato a Bilecolar.';
                }
                contactForm.reset();
                if (submitBtn) submitBtn.disabled = false;
            }, 1000);
        });
    }

    // Start App
    initData();
});
