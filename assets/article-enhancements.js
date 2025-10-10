/**
 * Article Enhancements JavaScript
 * Implements reading progress bar, sticky title, and related products functionality
 */

(function() {
  'use strict';

  /**
   * Main Article Enhancements Controller
   */
  class ArticleEnhancements {
    constructor() {
      this.progressBar = null;
      this.stickyTitle = null;
      this.relatedProducts = null;
      this.isMobile = window.innerWidth <= 768;
      
      this.init();
    }
    
    init() {
      // Initialize components
      this.progressBar = new ReadingProgress();
      this.stickyTitle = new ArticleHeader();
      this.relatedProducts = new RelatedProducts();
      
      // Set up responsive behavior
      this.detectDevice();
      this.initializeMetrics();
      
      // Listen for resize events
      window.addEventListener('resize', this.debounce(() => {
        this.detectDevice();
      }, 250));
    }
    
    detectDevice() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      document.body.classList.toggle('is-mobile', this.isMobile);
      
      // Reinitialize components if device type changed
      if (wasMobile !== this.isMobile) {
        this.relatedProducts?.handleDeviceChange();
      }
    }
    
    initializeMetrics() {
      // Track reading depth for analytics
      this.trackReadingDepth();
    }
    
    trackReadingDepth() {
      let maxScroll = 0;
      const articleContent = document.querySelector('.article__content');
      
      if (!articleContent) return;
      
      const articleHeight = articleContent.offsetHeight;
      const milestones = { 25: false, 50: false, 75: false, 100: false };
      
      const checkMilestone = () => {
        const currentScroll = window.pageYOffset + window.innerHeight;
        if (currentScroll > maxScroll) {
          maxScroll = currentScroll;
          const percentRead = Math.min((maxScroll / (articleHeight + articleContent.offsetTop)) * 100, 100);
          
          // Fire analytics events at milestones
          Object.keys(milestones).forEach(milestone => {
            if (percentRead >= milestone && !milestones[milestone]) {
              milestones[milestone] = true;
              this.fireAnalytics(`article_read_${milestone}`);
            }
          });
        }
      };
      
      // Use theme's scroll event if available, otherwise use native
      if (document.addEventListener) {
        document.addEventListener('theme:scroll', (e) => {
          checkMilestone();
        });
      } else {
        window.addEventListener('scroll', this.throttle(checkMilestone, 100));
      }
    }
    
    fireAnalytics(event) {
      // Fire analytics event
      if (window.Shopify && window.Shopify.analytics) {
        window.Shopify.analytics.publish(event, {
          article_id: document.querySelector('[data-article-id]')?.dataset.articleId,
          article_title: document.querySelector('.article__title')?.textContent
        });
      }
      
      // Also fire custom event for other tracking
      window.dispatchEvent(new CustomEvent('article:milestone', {
        detail: { event }
      }));
    }
    
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    
    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  }

  /**
   * Reading Progress Bar
   */
  class ReadingProgress {
    constructor() {
      this.progressBar = document.querySelector('[data-article-progress]');
      this.progressFill = document.querySelector('.article-progress-fill');
      this.article = document.querySelector('.article__content');
      this.ticking = false;
      
      this.init();
    }
    
    init() {
      if (!this.progressBar || !this.article) return;
      
      this.attachScrollListener();
    }
    
    attachScrollListener() {
      const updateProgress = () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.updateProgress();
            this.ticking = false;
          });
          this.ticking = true;
        }
      };
      
      // Use theme's scroll event if available
      if (document.addEventListener) {
        document.addEventListener('theme:scroll', (e) => {
          updateProgress();
        });
      } else {
        window.addEventListener('scroll', updateProgress);
      }
    }
    
    updateProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const trackLength = documentHeight - windowHeight;
      const scrollPercentage = (scrollTop / trackLength) * 100;
      
      if (this.progressFill) {
        this.progressFill.style.width = `${Math.min(scrollPercentage, 100)}%`;
        this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercentage));
      }
      
      // Show/hide progress bar
      if (scrollTop > 100) {
        this.progressBar?.classList.add('active');
      } else {
        this.progressBar?.classList.remove('active');
      }
    }
  }

  /**
   * Sticky Article Header
   */
  class ArticleHeader {
    constructor() {
      this.title = document.querySelector('.article__title');
      this.titleClone = null;
      this.threshold = 0;
      this.ticking = false;
      
      this.init();
    }
    
    init() {
      if (!this.title) return;
      
      // Store original position - include header height
      const headerHeight = 60; // Standard header height
      this.threshold = this.title.getBoundingClientRect().top + window.pageYOffset + headerHeight;
      
      // Create fixed version
      this.createFixedTitle();
      
      // Attach scroll listener
      this.attachScrollListener();
    }
    
    createFixedTitle() {
      this.titleClone = document.createElement('div');
      this.titleClone.className = 'article-title--fixed';
      this.titleClone.setAttribute('aria-hidden', 'true');
      
      const titleElement = document.createElement(this.title.tagName.toLowerCase());
      titleElement.textContent = this.title.textContent;
      this.titleClone.appendChild(titleElement);
      
      document.body.appendChild(this.titleClone);
    }
    
    attachScrollListener() {
      const updateTitle = () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.updateTitle();
            this.ticking = false;
          });
          this.ticking = true;
        }
      };
      
      // Use theme's scroll event if available
      if (document.addEventListener) {
        document.addEventListener('theme:scroll', (e) => {
          updateTitle();
        });
      } else {
        window.addEventListener('scroll', updateTitle);
      }
    }
    
    updateTitle() {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      
      // Only show when scrolled past the original title position
      if (scrolled > this.threshold) {
        this.titleClone?.classList.add('visible');
      } else {
        this.titleClone?.classList.remove('visible');
      }
    }
    
    destroy() {
      this.titleClone?.remove();
    }
  }

  /**
   * Related Products Handler
   */
  class RelatedProducts {
    constructor() {
      this.mobileDrawer = document.querySelector('[data-products-drawer]');
      this.toggleButton = document.querySelector('[data-products-toggle]');
      this.backdrop = document.querySelector('[data-backdrop]');
      this.closeButton = document.querySelector('[data-drawer-close]');
      this.productCount = document.querySelector('[data-product-count]');
      this.isOpen = false;
      this.products = [];
      
      this.init();
    }
    
    init() {
      this.loadProducts();
      this.attachEventListeners();
      this.initializeCartButtons();
      this.updateProductCount();
    }
    
    loadProducts() {
      // Get products from data attributes or API
      const productsData = document.querySelector('[data-related-products]')?.dataset.relatedProducts;
      if (productsData) {
        try {
          this.products = JSON.parse(productsData);
        } catch (e) {
          console.error('Failed to parse products data:', e);
        }
      }
    }
    
    attachEventListeners() {
      if (!this.mobileDrawer) return;
      
      // Toggle drawer
      this.toggleButton?.addEventListener('click', () => this.toggleDrawer());
      this.closeButton?.addEventListener('click', () => this.closeDrawer());
      this.backdrop?.addEventListener('click', () => this.closeDrawer());
      
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeDrawer();
        }
      });
      
      // Prevent body scroll when drawer is open
      this.mobileDrawer?.addEventListener('touchmove', (e) => {
        const target = e.target;
        const scrollableElement = target.closest('.related-products-drawer__content');
        if (!scrollableElement) {
          e.preventDefault();
        }
      });
    }
    
    toggleDrawer() {
      if (this.isOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    }
    
    openDrawer() {
      this.isOpen = true;
      this.mobileDrawer?.classList.add('active');
      this.backdrop?.classList.add('active');
      this.toggleButton?.setAttribute('aria-expanded', 'true');
      this.mobileDrawer?.setAttribute('aria-hidden', 'false');
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus management
      this.closeButton?.focus();
      
      // Fire event
      window.dispatchEvent(new CustomEvent('relatedProducts:open'));
    }
    
    closeDrawer() {
      this.isOpen = false;
      this.mobileDrawer?.classList.remove('active');
      this.backdrop?.classList.remove('active');
      this.toggleButton?.setAttribute('aria-expanded', 'false');
      this.mobileDrawer?.setAttribute('aria-hidden', 'true');
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Return focus
      this.toggleButton?.focus();
      
      // Fire event
      window.dispatchEvent(new CustomEvent('relatedProducts:close'));
    }
    
    initializeCartButtons() {
      const cartButtons = document.querySelectorAll('[data-add-to-cart]');
      
      cartButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const productId = button.dataset.productId || button.dataset.variantId;
          if (productId) {
            await this.addToCart(productId, button);
          }
        });
      });
    }
    
    async addToCart(variantId, button) {
      // Disable button and show loading state
      const originalText = button.innerHTML;
      button.disabled = true;
      button.classList.add('loading');
      
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            id: variantId,
            quantity: 1
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update cart UI
          this.updateCartUI(data);
          
          // Show success notification
          this.showCartNotification('Added to cart!');
          
          // Fire event
          window.dispatchEvent(new CustomEvent('cart:add', {
            detail: { product: data }
          }));
          
          // Update button temporarily
          button.innerHTML = '✓';
          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        } else {
          throw new Error('Failed to add to cart');
        }
      } catch (error) {
        console.error('Failed to add to cart:', error);
        this.showCartNotification('Failed to add to cart', 'error');
        button.innerHTML = originalText;
      } finally {
        button.disabled = false;
        button.classList.remove('loading');
      }
    }
    
    updateCartUI(data) {
      // Update cart count in header if present
      const cartCount = document.querySelector('[data-cart-count]');
      if (cartCount && data.quantity) {
        fetch('/cart.js')
          .then(res => res.json())
          .then(cart => {
            cartCount.textContent = cart.item_count;
            cartCount.classList.remove('hidden');
          });
      }
      
      // Update cart drawer if using theme's cart drawer
      if (window.theme && window.theme.cart) {
        window.theme.cart.updateCart();
      }
    }
    
    showCartNotification(message, type = 'success') {
      // Remove existing notification
      const existing = document.querySelector('.cart-notification');
      if (existing) {
        existing.remove();
      }
      
      // Create notification
      const notification = document.createElement('div');
      notification.className = `cart-notification cart-notification--${type}`;
      notification.textContent = message;
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'polite');
      
      document.body.appendChild(notification);
      
      // Remove after delay
      setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }
    
    updateProductCount() {
      if (this.productCount) {
        const count = document.querySelectorAll('[data-related-product]').length;
        this.productCount.textContent = count;
        
        // Hide tab if no products
        if (count === 0 && this.toggleButton) {
          this.toggleButton.parentElement.style.display = 'none';
        }
      }
    }
    
    handleDeviceChange() {
      // Close drawer if switching to desktop
      if (!window.matchMedia('(max-width: 768px)').matches && this.isOpen) {
        this.closeDrawer();
      }
    }
    
    destroy() {
      // Clean up event listeners
      this.toggleButton?.removeEventListener('click', this.toggleDrawer);
      this.closeButton?.removeEventListener('click', this.closeDrawer);
      this.backdrop?.removeEventListener('click', this.closeDrawer);
    }
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.articleEnhancements = new ArticleEnhancements();
    });
  } else {
    window.articleEnhancements = new ArticleEnhancements();
  }
  
  // Export for use in other scripts if needed
  window.ArticleEnhancements = ArticleEnhancements;
  window.ReadingProgress = ReadingProgress;
  window.ArticleHeader = ArticleHeader;
  window.RelatedProducts = RelatedProducts;

})();