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
        agenda: document.getElementById('view-agenda'),
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
        const subRoute = (parts[1] && parts[1] !== 'all') ? parts[1] : 'acousmatic';

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
    let isTransitioning = false;
    let worksOpenedFromMobile = false;

    function openWorksOverlay(fromMobile = false) {
        if (isTransitioning) return;
        worksOpenedFromMobile = fromMobile;

        if (!fromMobile) {
            mobileMenuOverlay.classList.remove('active', 'is-closing');
            hamburgerBtn.classList.remove('active');
        }

        worksOverlay.classList.remove('is-closing');
        worksOverlay.classList.add('active');
        document.body.classList.add('overlay-open');
    }

    function openMobileMenuOverlay() {
        if (isTransitioning) return;
        worksOpenedFromMobile = false;
        worksOverlay.classList.remove('active', 'is-closing');
        mobileMenuOverlay.classList.remove('is-closing');
        mobileMenuOverlay.classList.add('active');
        hamburgerBtn.classList.add('active');
        document.body.classList.add('overlay-open');
    }

    function closeOverlayWithAnimation(overlay, callback) {
        if (!overlay || !overlay.classList.contains('active')) {
            if (callback) callback();
            return;
        }

        isTransitioning = true;
        overlay.classList.add('is-closing');
        overlay.classList.remove('active');

        const onTransitionEnd = (e) => {
            if (e.target !== overlay) return;
            overlay.removeEventListener('transitionend', onTransitionEnd);
            overlay.classList.remove('is-closing');
            isTransitioning = false;
            const remaining = document.querySelectorAll('.fullscreen-overlay.active');
            if (remaining.length === 0) {
                document.body.classList.remove('overlay-open');
            }
            if (callback) callback();
        };

        // Fallback timeout in case transitionend does not fire (e.g. reduced motion)
        const fallbackTimer = setTimeout(() => {
            overlay.removeEventListener('transitionend', onTransitionEnd);
            overlay.classList.remove('is-closing');
            isTransitioning = false;
            const remaining = document.querySelectorAll('.fullscreen-overlay.active');
            if (remaining.length === 0) {
                document.body.classList.remove('overlay-open');
            }
            if (callback) callback();
        }, 550);

        overlay.addEventListener('transitionend', (e) => {
            clearTimeout(fallbackTimer);
            onTransitionEnd(e);
        });
    }

    function closeAllOverlays(callback) {
        worksOpenedFromMobile = false;
        document.body.classList.remove('overlay-open');
        let pending = 0;
        const checkDone = () => {
            pending--;
            if (pending <= 0) {
                hamburgerBtn.classList.remove('active');
                searchModal.classList.remove('active');
                if (callback) callback();
            }
        };

        const activeOverlays = [worksOverlay, mobileMenuOverlay].filter(o => o && o.classList.contains('active'));
        if (activeOverlays.length === 0) {
            hamburgerBtn.classList.remove('active');
            searchModal.classList.remove('active');
            if (callback) callback();
            return;
        }

        pending = activeOverlays.length;
        activeOverlays.forEach(overlay => closeOverlayWithAnimation(overlay, checkDone));
    }

    // Hamburger Button click
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            if (isTransitioning) return;
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
            const fromMobile = !!link.closest('#mobile-menu-overlay');
            openWorksOverlay(fromMobile);
        });
    });

    // Back buttons / close links inside overlays
    document.querySelectorAll('[data-action="close-overlay"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isTransitioning) {
                e.preventDefault();
                return;
            }

            const overlay = btn.closest('.fullscreen-overlay');

            // If BACK in works overlay was opened from mobile menu, return to mobile menu (§8)
            if (overlay === worksOverlay && worksOpenedFromMobile && !btn.hasAttribute('href')) {
                e.preventDefault();
                closeOverlayWithAnimation(worksOverlay, () => {
                    worksOpenedFromMobile = false;
                });
                return;
            }

            // If user clicked a category link inside works-overlay or link in mobile menu
            if (btn.hasAttribute('href') || overlay === mobileMenuOverlay) {
                closeAllOverlays();
                return;
            }

            // Normal overlay close (e.g. desktop BACK)
            if (overlay) {
                closeOverlayWithAnimation(overlay);
            } else {
                closeAllOverlays();
            }
        });
    });

    document.querySelectorAll('[data-action="back-to-menu"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isTransitioning) return;
            closeOverlayWithAnimation(worksOverlay, openMobileMenuOverlay);
        });
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

        // Assign IDs to agenda items for search targeting
        document.querySelectorAll('.agenda-item').forEach((item, index) => {
            if (!item.id) {
                item.id = `agenda-item-${index + 1}`;
            }
        });

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
            bioImgEl.alt = bio.title || 'bilecolar Bio Photo';
        }
    }

    const WORK_DATES = {
        'sinestesia': '2025',
        'tempo reale': '2025',
        'brassage': '2026',
        'learning': '2024'
    };

    function getWorkDate(work) {
        if (work.date) return work.date;
        const t = (work.title || '').toLowerCase();
        for (const [key, val] of Object.entries(WORK_DATES)) {
            if (t.includes(key)) return val;
        }
        return '';
    }

    function renderWorksList(works) {
        const worksGrid = document.getElementById('works-grid');
        if (!worksGrid) return;

        worksGrid.innerHTML = '';

        if (!works || works.length === 0) {
            worksGrid.innerHTML = '<p class="search-no-results">Nessun progetto disponibile.</p>';
            return;
        }

        works.forEach((work, index) => {
            const card = document.createElement('div');
            card.className = 'work-card';
            card.dataset.section = (work.section || '').toLowerCase();
            card.id = `work-card-${work._id || index}`;

            const detailsId = `work-details-${work._id || index}`;

            // Make card interactive and accessible (§5)
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-expanded', 'false');
            card.setAttribute('aria-controls', detailsId);

            card.innerHTML = `
                <div class="work-cover-wrapper">
                    <img src="${work.coverUrl || 'asset/pics/Brassage.jpg'}" alt="${work.title}" class="work-cover-img" loading="lazy">
                </div>
                <div class="work-card-header">
                    <span class="work-section-tag">${work.section || 'Work'}</span>
                    <h3 class="work-title">${work.title}</h3>
                </div>
                <div class="work-expandable" id="${detailsId}">
                    <div class="work-expandable-inner">
                        <div class="work-details">
                            <span class="work-date">${getWorkDate(work)}</span>
                            <p class="work-description">${work.description || ''}</p>
                            ${work.link ? `<a href="${work.link}" target="_blank" rel="noopener noreferrer" class="work-link" tabindex="-1">Ascolta / Vedi Progetto →</a>` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Toggle logic (§5.2: one open at a time, click again collapses)
            function toggleCard(e) {
                // If click was on the external link inside, let it navigate
                if (e && e.target.closest('.work-link')) return;

                const isCurrentlyExpanded = card.classList.contains('is-expanded');

                // Close all cards first
                document.querySelectorAll('.work-card').forEach(otherCard => {
                    otherCard.classList.remove('is-expanded');
                    otherCard.setAttribute('aria-expanded', 'false');
                    const link = otherCard.querySelector('.work-link');
                    if (link) link.setAttribute('tabindex', '-1');
                });

                // If it was not open, open it
                if (!isCurrentlyExpanded) {
                    card.classList.add('is-expanded');
                    card.setAttribute('aria-expanded', 'true');
                    const link = card.querySelector('.work-link');
                    if (link) link.removeAttribute('tabindex');
                }
            }

            card.addEventListener('click', toggleCard);

            // Keyboard accessibility (Enter / Space)
            card.addEventListener('keydown', (e) => {
                // If focused directly on the card (not the inner link)
                if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    toggleCard();
                }
            });

            worksGrid.appendChild(card);
        });
    }

    function switchWorksTab(tabName) {
        const targetTab = (!tabName || tabName === 'all') ? 'acousmatic' : tabName;
        const tabs = document.querySelectorAll('.works-tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.tab.toLowerCase() === targetTab.toLowerCase()) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            if (card.dataset.section === targetTab.toLowerCase()) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        AppState.currentWorksTab = targetTab;
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

        // Search Agenda (§7: index agenda items)
        const agendaItems = document.querySelectorAll('.agenda-item');
        agendaItems.forEach((item, index) => {
            const text = item.textContent || '';
            if (text.toLowerCase().includes(query)) {
                // Find year heading
                const yearHeading = item.closest('.agenda-list')?.previousElementSibling;
                const year = yearHeading ? yearHeading.textContent.trim() : 'Agenda';
                
                // Truncate or use meaningful snippet
                let snippet = text.replace(/\s+/g, ' ').trim();
                if (snippet.length > 100) {
                    const matchIndex = snippet.toLowerCase().indexOf(query);
                    const start = Math.max(0, matchIndex - 30);
                    snippet = (start > 0 ? '...' : '') + snippet.substring(start, start + 90) + '...';
                }

                // First few words as title
                const parts = text.split('•');
                const title = parts.length > 1 ? `${parts[0].trim()} • ${parts[1].trim().split(',')[0]}` : text.substring(0, 40);

                matches.push({
                    title: `${title} (${year})`,
                    snippet: snippet,
                    badge: 'Agenda',
                    hash: '#agenda',
                    elementId: item.id || null
                });
            }
        });

        // Render Results
        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">Nessun risultato trovato</div>';
            return;
        }

        searchResults.innerHTML = matches.map((match, idx) => `
            <div class="search-result-item" data-hash="${match.hash}" data-element-id="${match.elementId || ''}">
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
                const elementId = item.dataset.elementId;
                searchModal.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
                window.location.hash = targetHash;

                if (elementId) {
                    setTimeout(() => {
                        const targetEl = document.getElementById(elementId);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.style.transition = 'background 0.5s ease';
                            targetEl.style.background = 'rgba(197, 240, 225, 0.15)';
                            setTimeout(() => { targetEl.style.background = ''; }, 2000);
                        }
                    }, 300);
                }
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
