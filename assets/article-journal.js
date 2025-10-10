/**
 * Article Journal Template - Interactive JavaScript
 * Handles: Progress bar, sticky header, table of contents, smooth scrolling
 */

(function() {
  'use strict';

  // Cache DOM elements
  const elements = {
    progressBar: document.querySelector('[data-article-progress-fill]'),
    progressText: document.querySelector('[data-article-progress-text]'),
    stickyHeader: document.querySelector('[data-article-sticky-header]'),
    articleContent: document.querySelector('[data-article-content]'),
    articleHero: document.querySelector('[data-article-hero]'),
    tocDesktop: document.querySelector('[data-toc-desktop]'),
    tocMobile: document.querySelector('[data-toc-mobile]'),
    copyLinkButtons: document.querySelectorAll('[data-copy-link]')
  };

  // Configuration
  const config = {
    stickyHeaderOffset: 200,
    throttleDelay: 16, // ~60fps
    tocHighlightOffset: 100
  };

  /**
   * Hide third-party widgets on article pages
   * Dynamically removes widgets that are injected after page load
   */
  function hideThirdPartyWidgets() {
    // Selectors for common third-party widgets
    const widgetSelectors = [
      // Live chat widgets
      'iframe[title*="chat" i]',
      'iframe[src*="tawk"]',
      'iframe[src*="crisp"]',
      'iframe[src*="tidio"]',
      'iframe[src*="zendesk"]',
      'iframe[src*="intercom"]',
      'iframe[src*="drift"]',
      'iframe[src*="freshchat"]',
      'iframe[src*="gorgias"]',
      'iframe[src*="richpanel"]',
      'iframe[src*="rich-panel"]',
      'div[class*="rich-panel"]',
      'div[class*="richpanel"]',
      'div[id*="rich-panel"]',
      'div[id*="richpanel"]',
      '.rich-panel-launcher',
      '.richpanel-launcher',
      
      // Rewards/loyalty widgets
      'iframe[src*="smile"]',
      'iframe[src*="yotpo"]',
      'iframe[src*="stamped"]',
      'iframe[src*="loox"]',
      'iframe[src*="okendo"]',
      'iframe[src*="growave"]',
      'iframe[src*="loyalty"]',
      'iframe[src*="rewards"]',
      '.smile-launcher-frame',
      '.smile-launcher',
      '.yotpo-widget-instance',
      '.stamped-launcher',
      '.loox-floating-widget',
      '.growave-launcher',
      
      // Specific app containers
      '#tidio-chat',
      '#tawk-widget',
      '#crisp-chatbox',
      '#zendesk-widget',
      '#intercom-container',
      '#drift-widget',
      '.gorgias-chat-container',
      
      // Generic floating widgets
      'div[class*="floating-widget"]',
      'div[class*="chat-widget"]',
      'div[class*="widget-container"][style*="fixed"]'
    ];
    
    // Hide all matching elements
    widgetSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Check if element is a floating widget (positioned fixed at bottom)
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          if (style.position === 'fixed' && 
              (rect.bottom > window.innerHeight - 200 || rect.right > window.innerWidth - 200)) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '-9999';
          }
        });
      } catch (e) {
        // Silently fail for invalid selectors
      }
    });
    
    // Also hide elements injected with inline styles
    const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
    fixedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Check if it's positioned at the bottom right (typical for chat/rewards widgets)
      if (rect.bottom > window.innerHeight - 200 && rect.right > window.innerWidth - 200) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '-9999';
      }
    });
  }

  // Run widget hiding on page load and observe for new elements
  if (document.body.classList.contains('template-article')) {
    // Initial hiding
    hideThirdPartyWidgets();
    
    // Watch for dynamically added widgets
    const observer = new MutationObserver(throttle(hideThirdPartyWidgets, 500));
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check periodically for widgets that might be added later
    setTimeout(hideThirdPartyWidgets, 1000);
    setTimeout(hideThirdPartyWidgets, 3000);
    setTimeout(hideThirdPartyWidgets, 5000);
  }

  /**
   * Throttle function for performance
   */
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function(...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Calculate and update reading progress
   */
  function updateProgress() {
    if (!elements.progressBar || !elements.articleContent) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackLength = documentHeight - windowHeight;
    const progress = Math.min((scrollTop / trackLength) * 100, 100);

    // Update progress bar
    elements.progressBar.style.width = progress + '%';

    // Update progress text if exists
    if (elements.progressText) {
      elements.progressText.textContent = Math.round(progress) + '%';
    }
  }

  /**
   * Toggle sticky header visibility
   */
  function updateStickyHeader() {
    if (!elements.stickyHeader || !elements.articleHero) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const heroBottom = elements.articleHero.offsetTop + elements.articleHero.offsetHeight;

    if (scrollTop > heroBottom) {
      elements.stickyHeader.classList.add('is-visible');
    } else {
      elements.stickyHeader.classList.remove('is-visible');
    }
  }

  /**
   * Generate table of contents from article headings
   */
  function generateTableOfContents() {
    if (!elements.articleContent) return;

    const headings = elements.articleContent.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const tocHTML = Array.from(headings).map((heading, index) => {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }

      const level = heading.tagName.toLowerCase();
      const indent = level === 'h3' ? 'style="padding-left: 1.5rem;"' : '';

      return `
        <li class="article-toc__item" ${indent}>
          <a href="#${heading.id}" class="article-toc__link" data-toc-link="${heading.id}">
            ${heading.textContent}
          </a>
        </li>
      `;
    }).join('');

    // Populate both desktop and mobile TOC
    if (elements.tocDesktop) {
      elements.tocDesktop.innerHTML = `<ul class="article-toc__list">${tocHTML}</ul>`;
    }
    if (elements.tocMobile) {
      elements.tocMobile.innerHTML = `<ul class="article-toc__list">${tocHTML}</ul>`;
    }

    // Add smooth scrolling to TOC links
    document.querySelectorAll('[data-toc-link]').forEach(link => {
      link.addEventListener('click', handleTocClick);
    });
  }

  /**
   * Handle TOC link clicks with smooth scrolling
   */
  function handleTocClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('data-toc-link');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const offset = 80; // Account for sticky header
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Close mobile TOC if open (Alpine.js will handle this)
      const mobileToggle = document.querySelector('.article-toc-mobile__toggle');
      if (mobileToggle && window.innerWidth < 990) {
        mobileToggle.click();
      }
    }
  }

  /**
   * Highlight current section in TOC
   */
  function updateTocHighlight() {
    if (!elements.articleContent) return;

    const headings = elements.articleContent.querySelectorAll('h2, h3');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let currentHeading = null;

    // Find the current heading
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= config.tocHighlightOffset) {
        currentHeading = heading;
      }
    });

    // Update active state
    document.querySelectorAll('[data-toc-link]').forEach(link => {
      link.classList.remove('is-active');
      if (currentHeading && link.getAttribute('data-toc-link') === currentHeading.id) {
        link.classList.add('is-active');
      }
    });
  }

  /**
   * Handle copy link functionality
   */
  function setupCopyLinks() {
    elements.copyLinkButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const url = this.getAttribute('data-url');
        
        try {
          await navigator.clipboard.writeText(url);
          
          // Visual feedback
          this.classList.add('copied');
          
          // Reset after 2 seconds
          setTimeout(() => {
            this.classList.remove('copied');
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            this.classList.add('copied');
            setTimeout(() => {
              this.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy link');
          }
          
          document.body.removeChild(textArea);
        }
      });
    });
  }

  /**
   * Initialize lazy loading for images
   */
  function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const images = document.querySelectorAll('.article-content img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('is-loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Main scroll handler (throttled)
   */
  const handleScroll = throttle(() => {
    updateProgress();
    updateStickyHeader();
    updateTocHighlight();
  }, config.throttleDelay);

  /**
   * Initialize everything
   */
  function init() {
    // Generate TOC
    generateTableOfContents();

    // Setup copy links
    setupCopyLinks();

    // Setup lazy loading
    setupLazyLoading();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial updates
    updateProgress();
    updateStickyHeader();
    updateTocHighlight();

    // Handle window resize
    window.addEventListener('resize', throttle(() => {
      updateProgress();
      updateTocHighlight();
    }, 250));
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();