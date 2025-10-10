/**
 * Listicle Mobile Enhancements
 * Optimized for mobile-first experience
 */

(function() {
  'use strict';
  
  // Only run on listicle pages
  if (!document.body.classList.contains('template-listicle')) {
    return;
  }
  
  /**
   * Sticky CTA Bar for Mobile
   * Shows after scrolling past first list item
   * Hides when scrolling up for better reading experience
   */
  function initStickyCTA() {
    // Only on mobile devices
    if (window.innerWidth > 768) return;
    
    // Create sticky CTA if it doesn't exist
    let stickyCTA = document.querySelector('.listicle-sticky-cta');
    if (!stickyCTA) {
      stickyCTA = createStickyCTA();
    }
    
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let isVisible = false;
    
    // Get first list item position
    const firstListItem = document.querySelector('.template-listicle .section-double');
    if (!firstListItem) return;
    
    const triggerPoint = firstListItem.offsetTop + firstListItem.offsetHeight;
    
    // Throttle scroll events for performance
    let ticking = false;
    function updateCTA() {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        scrollDirection = 'down';
      } else if (currentScrollY < lastScrollY) {
        scrollDirection = 'up';
      }
      
      // Show/hide logic
      if (currentScrollY > triggerPoint) {
        if (scrollDirection === 'down' && !isVisible) {
          stickyCTA.classList.add('is-visible');
          stickyCTA.classList.remove('is-hidden');
          isVisible = true;
        } else if (scrollDirection === 'up' && isVisible) {
          stickyCTA.classList.add('is-hidden');
          stickyCTA.classList.remove('is-visible');
          isVisible = false;
        }
      } else {
        stickyCTA.classList.remove('is-visible', 'is-hidden');
        isVisible = false;
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    }
    
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateCTA);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  
  /**
   * Create Sticky CTA HTML
   */
  function createStickyCTA() {
    const ctaBar = document.createElement('div');
    ctaBar.className = 'listicle-sticky-cta';
    ctaBar.innerHTML = `
      <button class="listicle-sticky-cta__button" onclick="window.location.href='/collections/all'">
        Shop Now - Free Shipping
      </button>
    `;
    document.body.appendChild(ctaBar);
    return ctaBar;
  }
  
  /**
   * Optimize Images for Mobile
   * Add lazy loading and proper sizing
   */
  function optimizeImages() {
    const images = document.querySelectorAll('.template-listicle .section-double img');
    
    images.forEach((img, index) => {
      // Skip first two images (above fold)
      if (index > 1) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
      
      // Add explicit dimensions to prevent layout shift
      if (!img.hasAttribute('width') && img.naturalWidth) {
        img.setAttribute('width', img.naturalWidth);
      }
      if (!img.hasAttribute('height') && img.naturalHeight) {
        img.setAttribute('height', img.naturalHeight);
      }
    });
  }
  
  /**
   * Enhance Touch Interactions
   */
  function enhanceTouchTargets() {
    // Ensure all buttons and links meet minimum touch target size
    const interactiveElements = document.querySelectorAll('.template-listicle a, .template-listicle button');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.height < 44) {
        const padding = (44 - rect.height) / 2;
        element.style.paddingTop = `${padding}px`;
        element.style.paddingBottom = `${padding}px`;
      }
    });
  }
  
  /**
   * Add Read More functionality for long content
   * Mobile users prefer shorter initial content
   */
  function addReadMore() {
    if (window.innerWidth > 640) return;
    
    const textBlocks = document.querySelectorAll('.template-listicle .section-double .hero__rte');
    
    textBlocks.forEach(block => {
      const fullText = block.innerHTML;
      const words = block.textContent.split(' ');
      
      // If more than 50 words, truncate
      if (words.length > 50) {
        const truncated = words.slice(0, 50).join(' ');
        const remaining = words.slice(50).join(' ');
        
        block.innerHTML = `
          <div class="listicle-text-content">
            <span class="listicle-text-truncated">${truncated}...</span>
            <span class="listicle-text-full" style="display: none;">${fullText}</span>
            <button class="listicle-read-more" style="
              background: none;
              border: none;
              color: var(--color-primary);
              font-weight: 600;
              padding: 8px 0;
              margin-top: 8px;
              font-size: 16px;
              text-decoration: underline;
              cursor: pointer;
            ">Read more</button>
          </div>
        `;
        
        const readMoreBtn = block.querySelector('.listicle-read-more');
        const truncatedText = block.querySelector('.listicle-text-truncated');
        const fullTextSpan = block.querySelector('.listicle-text-full');
        
        readMoreBtn.addEventListener('click', function() {
          if (truncatedText.style.display !== 'none') {
            truncatedText.style.display = 'none';
            fullTextSpan.style.display = 'inline';
            this.textContent = 'Read less';
          } else {
            truncatedText.style.display = 'inline';
            fullTextSpan.style.display = 'none';
            this.textContent = 'Read more';
          }
        });
      }
    });
  }
  
  /**
   * Mobile-specific performance monitoring
   */
  function monitorPerformance() {
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP observer not supported
      }
      
      // Monitor Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsScore = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
          console.log('CLS:', clsScore);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS observer not supported
      }
    }
  }
  
  /**
   * Initialize all mobile enhancements
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Initialize features
    initStickyCTA();
    optimizeImages();
    enhanceTouchTargets();
    addReadMore();
    
    // Monitor performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('myshopify.com')) {
      monitorPerformance();
    }
    
    // Reinitialize on resize (orientation change)
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        initStickyCTA();
        enhanceTouchTargets();
        addReadMore();
      }, 250);
    });
  }
  
  // Start initialization
  init();
  
})();