/**
 * UI Controller Module
 * Handles all UI rendering and interactions
 */

const UIController = (() => {

  /**
   * Show loading spinner
   */
  const showLoading = (container) => {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  };

  /**
   * Show error message
   */
  const showError = (container, message) => {
    container.innerHTML = `
      <div class="glass-card text-center" style="max-width: 600px; margin: 4rem auto;">
        <h2 style="color: var(--accent-primary); margin-bottom: 1rem;">⚠️ Error</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  };

  /**
   * Render chapter cards
   */
  const renderChapters = (chapters, container) => {
    const chaptersHTML = chapters.map(chapter => `
      <div class="glass-card chapter-card" onclick="goToChapter(${chapter.number})">
        <div class="chapter-number">${String(chapter.number).padStart(2, '0')}</div>
        <h3 class="chapter-title">${chapter.name}</h3>
        <p class="chapter-title-sans">${chapter.sanskrit}</p>
        <div class="chapter-meta">${chapter.verses} Verses</div>
      </div>
    `).join('');

    container.innerHTML = chaptersHTML;
  };

  /**
   * Render verse display
   */
  const renderVerse = (verse, chapterInfo, container) => {
    // Extract commentary text (handle different possible formats)
    let commentary = '';
    if (verse.commentaries) {
      // Try to get the first available commentary
      if (typeof verse.commentaries === 'string') {
        commentary = verse.commentaries;
      } else if (typeof verse.commentaries === 'object') {
        // Get first commentary from object
        const keys = Object.keys(verse.commentaries);
        if (keys.length > 0) {
          commentary = verse.commentaries[keys[0]] || '';
        }
      }
    }

    const verseHTML = `
      <div class="verse-header">
        <div class="verse-number">Chapter ${chapterInfo.number} • Verse ${verse.verse}</div>
        <h2 class="chapter-title">${chapterInfo.name}</h2>
        <p class="chapter-title-sans">${chapterInfo.sanskrit}</p>
      </div>
      
      <div class="verse-card glass-card">
        <div class="verse-sanskrit" id="verseText">
          ${verse.text.replace(/\n/g, '<br>')}
          <button class="copy-btn" onclick="copyShloka()" title="Copy Sanskrit text">
            📋 Copy
          </button>
        </div>
        
        ${verse.transliteration ? `
          <div class="verse-section">
            <h3 class="verse-section-title">Transliteration</h3>
            <p class="verse-transliteration">${verse.transliteration}</p>
          </div>
        ` : ''}
        
        ${verse.translation ? `
          <div class="verse-section">
            <h3 class="verse-section-title">Translation</h3>
            <p class="verse-translation">${verse.translation}</p>
          </div>
        ` : ''}
        
        ${commentary ? `
          <div class="verse-section">
            <h3 class="verse-section-title">Commentary</h3>
            <p class="verse-translation">${commentary}</p>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = verseHTML;
  };

  /**
   * Render verse navigation controls
   */
  const renderVerseNavigation = (currentChapter, currentVerse, totalVerses, container) => {
    const hasPrevious = currentVerse > 1 || currentChapter > 1;
    const hasNext = currentVerse < totalVerses || currentChapter < 18;

    const navHTML = `
      <div class="verse-nav">
        <button 
          class="btn btn-glass verse-nav-btn" 
          ${!hasPrevious ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
          onclick="navigateVerse('previous')"
        >
          ← Previous
        </button>
        
        <select class="chapter-selector" onchange="changeChapter(this.value)">
          ${Array.from({ length: 18 }, (_, i) => i + 1).map(num => `
            <option value="${num}" ${num === currentChapter ? 'selected' : ''}>
              Chapter ${num}
            </option>
          `).join('')}
        </select>
        
        <button 
          class="btn btn-glass verse-nav-btn" 
          ${!hasNext ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
          onclick="navigateVerse('next')"
        >
          Next →
        </button>
      </div>
    `;

    container.innerHTML = navHTML;
  };

  /**
   * Filter chapters based on search query
   */
  const filterChapters = (chapters, query) => {
    if (!query) return chapters;

    const lowerQuery = query.toLowerCase();
    return chapters.filter(chapter =>
      chapter.name.toLowerCase().includes(lowerQuery) ||
      chapter.sanskrit.includes(query) ||
      chapter.number.toString().includes(query)
    );
  };

  /**
   * Animate element entrance
   */
  const animateIn = (element, delay = 0) => {
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 50);
    }, delay);
  };

  /**
   * Scroll to top smoothly
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /**
   * Create notification toast
   */
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'toast glass-card';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      min-width: 250px;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    `;

    const colors = {
      success: 'var(--accent-primary)',
      error: '#ff4444',
      info: 'var(--text-secondary)'
    };

    toast.innerHTML = `
      <div style="color: ${colors[type] || colors.info}; font-weight: 600;">
        ${message}
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  /**
   * Copy shloka text to clipboard
   */
  const copyShloka = () => {
    const verseElement = document.getElementById('verseText');
    if (!verseElement) return;

    // Get text content without HTML tags
    const text = verseElement.innerText.replace('📋 Copy', '').trim();

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ Shloka copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy:', err);
      showToast('Failed to copy text', 'error');
    });
  };

  // Public API
  return {
    showLoading,
    showError,
    renderChapters,
    renderVerse,
    renderVerseNavigation,
    filterChapters,
    animateIn,
    scrollToTop,
    showToast,
    copyShloka
  };
})();

// Add toast animations to document
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(100px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(100px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
}
