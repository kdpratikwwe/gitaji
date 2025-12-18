/**
 * Main Application Module
 * Initializes the application and handles global functionality
 */

(function () {
    'use strict';

    // Application state
    const AppState = {
        currentPage: '',
        isLoading: false
    };

    /**
     * Detect current page
     */
    function detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('chapters.html')) {
            return 'chapters';
        } else if (path.includes('verse.html')) {
            return 'verse';
        } else {
            return 'home';
        }
    }

    /**
     * Initialize application
     */
    function init() {
        AppState.currentPage = detectCurrentPage();
        console.log(`Bhagavad Gita App initialized on: ${AppState.currentPage}`);

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Add page-specific initialization
        switch (AppState.currentPage) {
            case 'home':
                initHomePage();
                break;
            case 'chapters':
                // Chapters page has its own initialization in the HTML
                break;
            case 'verse':
                // Verse page has its own initialization in the HTML
                break;
        }

        // Initialize global features
        initNavigation();
        checkServiceWorker();
    }

    /**
     * Initialize home page specific features
     */
    function initHomePage() {
        // Add parallax effect to hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            });
        }
    }

    /**
     * Initialize navigation
     */
    function initNavigation() {
        // Highlight active nav item
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav a');

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath.split('/').pop()) {
                link.style.color = 'var(--accent-primary)';
            }
        });
    }

    /**
     * Check for service worker support (for future PWA implementation)
     */
    function checkServiceWorker() {
        if ('serviceWorker' in navigator) {
            console.log('Service Worker supported - can be implemented for offline access');
        }
    }

    /**
     * Handle window resize
     */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log('Window resized');
            // Add any resize-specific logic here
        }, 250);
    });

    /**
     * Global error handler
     */
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });

    /**
     * Handle unhandled promise rejections
     */
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose some utilities globally if needed
    window.BhagavadGitaApp = {
        state: AppState,
        version: '1.0.0'
    };

})();
