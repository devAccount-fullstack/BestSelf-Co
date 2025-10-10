/**
 * Tiered Free Gift System
 * Triggers pop-up selection when cart crosses spending thresholds
 * $45+: Choose 1 gift from tier 1
 * $60+: Choose 2 gifts total (tier 1 + tier 2)
 * $85+: Choose 3 gifts total (all tiers) + free shipping
 */

(function() {
  'use strict';

  const TieredGiftSystem = {
    // Configuration
    config: {
      thresholds: {
        tier1: 4500, // $45 in cents
        tier2: 6000, // $60 in cents
        tier3: 8500  // $85 in cents (changed from $80 to $85)
      },
      gifts: {
        tier1: [
          { id: '42128319643717', title: 'Pomodoro Timer', handle: 'pomodoro-timer', image: '', price: 0 },
          { id: '42208958578757', title: '6-Pack Pastel Highlighter Set', handle: 'highlighter-pen', image: '', price: 0 },
          { id: '42128400547909', title: 'Ideas Pocket Notebook', handle: 'ideas-pocket-notebook', image: '', price: 0 }
        ],
        tier2: [
          { id: '40614671155269', title: 'Little Talk Expansion Pack', handle: 'little-talk-deck-expansion-pack', image: '', price: 0 },
          { id: '40709218172997', title: 'Intimacy Deck Expansion', handle: 'intimacy-deck-expansion-pack', image: '', price: 0 },
          { id: '32003212968005', title: 'Annual Review Workbook (Digital Download)', handle: 'year-end-review', image: '', price: 0 }
        ],
        tier3: [
          { id: '31816763539525', title: '30-Day Gratitude Journal', handle: '30-day-gratitude-journal', image: '', price: 0 },
          { id: '39585119273029', title: 'Doodle Deck & Pad', handle: 'doodle-deck', image: '', price: 0 },
          { id: '40489789784133', title: "It's a Date", handle: 'its-a-date', image: '', price: 0 }
        ]
      },
      storage: {
        state: 'tiered_gift_state',
        skipSession: 'tiered_gift_session_skip'
      }
    },

    // State management
    state: {
      thresholdsShown: {
        tier1: false,
        tier2: false,
        tier3: false
      },
      giftsSelected: {
        tier1: [],
        tier2: [],
        tier3: []
      },
      lastCartTotal: 0,
      sessionId: null,
      isProcessing: false
    },

    // Initialize the system
    init() {
      this.loadState();
      this.attachEventListeners();
      this.loadGiftImages();
      this.checkInitialCart();
      this.injectCartNotification();
    },

    // Load saved state from sessionStorage
    loadState() {
      const savedState = sessionStorage.getItem(this.config.storage.state);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          this.state = { ...this.state, ...parsed };
        } catch (e) {
          console.error('Failed to load gift state:', e);
        }
      }
      
      // Generate or restore session ID
      if (!this.state.sessionId) {
        this.state.sessionId = Date.now().toString(36) + Math.random().toString(36);
        this.saveState();
      }
    },

    // Save state to sessionStorage
    saveState() {
      sessionStorage.setItem(this.config.storage.state, JSON.stringify(this.state));
    },

    // Load gift product images using handles
    async loadGiftImages() {
      // Fetch product data for gift items using product handles
      const allGifts = [
        ...this.config.gifts.tier1,
        ...this.config.gifts.tier2,
        ...this.config.gifts.tier3
      ];

      try {
        // Fetch product data using Shopify's product API
        const productDataPromises = allGifts.map(async (gift) => {
          if (!gift.handle) {
            console.warn(`No handle for gift ${gift.title}`);
            return null;
          }
          
          try {
            // Fetch product data using the handle
            const response = await fetch(`/products/${gift.handle}.js`);
            
            if (response.ok) {
              const productData = await response.json();
              
              // Find the specific variant in the product data
              const variant = productData.variants.find(v => v.id.toString() === gift.id);
              
              if (variant) {
                // Update gift object with actual data
                gift.image = variant.featured_image?.src || productData.featured_image || '';
                gift.price = variant.price || 0;
                gift.product_title = productData.title || gift.title;
                gift.vendor = productData.vendor || '';
                gift.product_id = productData.id;
              } else {
                // Use product-level data if specific variant not found
                gift.image = productData.featured_image || '';
                gift.price = productData.price || 0;
                gift.product_title = productData.title || gift.title;
                gift.vendor = productData.vendor || '';
                gift.product_id = productData.id;
              }
              
              return productData;
            } else {
              console.warn(`Product not found: ${gift.handle}`);
              return null;
            }
          } catch (e) {
            console.warn(`Error fetching product ${gift.handle}:`, e);
            return null;
          }
        });
        
        // Wait for all product data to be fetched
        await Promise.all(productDataPromises);
        
      } catch (e) {
        console.error('Error loading gift product images:', e);
        
        // Fallback: Use placeholder images if API fails
        allGifts.forEach(gift => {
          if (!gift.image) {
            // Use a placeholder image with the product title
            gift.image = `https://via.placeholder.com/300x300/f0f0f0/333333?text=${encodeURIComponent(gift.title)}`;
          }
        });
      }
    },

    // Attach event listeners
    attachEventListeners() {
      // Listen for cart updates
      document.addEventListener('theme:cart:change', this.onCartChange.bind(this));
      
      // Listen for add to cart events
      document.addEventListener('theme:product:add', this.onProductAdd.bind(this));
      
      // Custom event for cart API responses
      document.addEventListener('cart:updated', this.onCartUpdated.bind(this));

      // Intercept fetch requests to cart/add.js
      this.interceptCartAdd();
    },

    // Check cart on page load
    async checkInitialCart() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        this.checkThresholds(cart.total_price);
      } catch (e) {
        console.error('Failed to check initial cart:', e);
      }
    },

    // Handle cart change events
    onCartChange(event) {
      if (event.detail && event.detail.cart) {
        this.checkThresholds(event.detail.cart.total_price);
      }
    },

    // Handle product add events
    async onProductAdd(event) {
      // Fetch updated cart
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Calculate non-gift total
        const nonGiftTotal = this.calculateNonGiftTotal(cart);
        this.checkThresholds(nonGiftTotal);
      } catch (e) {
        console.error('Failed to fetch cart after product add:', e);
      }
    },

    // Handle cart updated events
    onCartUpdated(event) {
      if (event.detail && event.detail.total) {
        this.checkThresholds(event.detail.total);
      }
    },

    // Intercept cart/add.js and cart/change.js requests
    interceptCartAdd() {
      const originalFetch = window.fetch;
      const self = this;

      window.fetch = function(...args) {
        const [url, options] = args;
        
        // Check if this is a cart/add, cart/change, or cart/update request
        if (typeof url === 'string' && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update'))) {
          // Call original fetch
          return originalFetch.apply(this, args).then(async response => {
            if (response.ok) {
              // Clone response for processing
              const clonedResponse = response.clone();
              
              // Process the response
              try {
                const data = await clonedResponse.json();
                
                // Fetch updated cart
                setTimeout(async () => {
                  try {
                    const cartResponse = await originalFetch('/cart.js');
                    const cart = await cartResponse.json();
                    
                    // Check thresholds with new cart total
                    const nonGiftTotal = self.calculateNonGiftTotal(cart);
                    self.checkThresholds(nonGiftTotal);
                  } catch (e) {
                    console.error('Failed to check cart after update:', e);
                  }
                }, 500); // Small delay to ensure cart is updated
              } catch (e) {
                console.error('Failed to process cart response:', e);
              }
            }
            
            return response;
          });
        }
        
        // For non-cart requests, use original fetch
        return originalFetch.apply(this, args);
      };
    },

    // Monitor Alpine.js cart store for 42-drawer
    monitorAlpineCart() {
      if (window.Alpine && window.Alpine.store) {
        const cartStore = window.Alpine.store('cart');
        if (cartStore) {
          // Monitor for total price changes
          let lastTotal = 0;
          setInterval(() => {
            if (cartStore.obj && cartStore.obj.total_price !== undefined) {
              const currentTotal = cartStore.obj.total_price;
              if (currentTotal !== lastTotal) {
                lastTotal = currentTotal;
                this.state.lastCartTotal = currentTotal;
                this.saveState();
                this.checkThresholds(currentTotal);
                this.updateCartNotification();
              }
            }
          }, 1000);
        }
      }
    },

    // Calculate cart total excluding gift items
    calculateNonGiftTotal(cart) {
      const giftVariantIds = [
        ...this.config.gifts.tier1,
        ...this.config.gifts.tier2,
        ...this.config.gifts.tier3
      ].map(gift => parseInt(gift.id));

      let total = 0;
      
      cart.items.forEach(item => {
        // Only count non-gift items
        if (!giftVariantIds.includes(item.variant_id)) {
          total += item.line_price;
        }
      });

      return total;
    },

    // Check if any threshold has been crossed
    checkThresholds(cartTotal) {
      // Prevent multiple simultaneous checks
      if (this.state.isProcessing) return;
      
      const previousTotal = this.state.lastCartTotal;
      this.state.lastCartTotal = cartTotal;

      // Check if session skip is active
      if (this.isSessionSkipped()) return;

      // Tier 3: $85+
      if (!this.state.thresholdsShown.tier3 && cartTotal >= this.config.thresholds.tier3 && previousTotal < this.config.thresholds.tier3) {
        this.showTierPopup(3);
        return;
      }

      // Tier 2: $60+
      if (!this.state.thresholdsShown.tier2 && cartTotal >= this.config.thresholds.tier2 && previousTotal < this.config.thresholds.tier2) {
        this.showTierPopup(2);
        return;
      }

      // Tier 1: $45+
      if (!this.state.thresholdsShown.tier1 && cartTotal >= this.config.thresholds.tier1 && previousTotal < this.config.thresholds.tier1) {
        this.showTierPopup(1);
        return;
      }

      // Handle cart reduction
      if (cartTotal < this.config.thresholds.tier1) {
        // Remove all gifts if cart drops below tier 1
        this.removeAllGifts();
      } else if (cartTotal < this.config.thresholds.tier2 && this.state.thresholdsShown.tier2) {
        // Remove tier 2 & 3 gifts if cart drops below tier 2
        this.removeGiftsAboveTier(1);
      } else if (cartTotal < this.config.thresholds.tier3 && this.state.thresholdsShown.tier3) {
        // Remove tier 3 gifts if cart drops below tier 3
        this.removeGiftsAboveTier(2);
      }

      this.saveState();
    },

    // Check if user skipped selection in this session
    isSessionSkipped() {
      const skipData = sessionStorage.getItem(this.config.storage.skipSession);
      if (skipData) {
        const skipSession = JSON.parse(skipData);
        return skipSession.sessionId === this.state.sessionId;
      }
      return false;
    },

    // Show tier selection popup
    showTierPopup(tier) {
      this.state.isProcessing = true;
      
      // Determine how many gifts to select
      let giftsToSelect = tier;
      const alreadySelected = this.countSelectedGifts();
      const additionalGifts = giftsToSelect - alreadySelected;

      if (additionalGifts <= 0) {
        // Already have enough gifts selected
        this.state.thresholdsShown[`tier${tier}`] = true;
        this.state.isProcessing = false;
        this.saveState();
        return;
      }

      // Get available gifts for selection
      const availableGifts = this.getAvailableGifts(tier);

      // Create and show popup
      this.createPopup(tier, availableGifts, additionalGifts);
      
      // Mark threshold as shown
      this.state.thresholdsShown[`tier${tier}`] = true;
      this.saveState();
    },

    // Get available gifts for a tier
    getAvailableGifts(tier) {
      let gifts = [];
      
      if (tier >= 1) gifts = [...gifts, ...this.config.gifts.tier1];
      if (tier >= 2) gifts = [...gifts, ...this.config.gifts.tier2];
      if (tier >= 3) gifts = [...gifts, ...this.config.gifts.tier3];

      // Filter out already selected gifts
      const selectedIds = [
        ...this.state.giftsSelected.tier1,
        ...this.state.giftsSelected.tier2,
        ...this.state.giftsSelected.tier3
      ];

      return gifts.filter(gift => !selectedIds.includes(gift.id));
    },

    // Count total selected gifts
    countSelectedGifts() {
      return this.state.giftsSelected.tier1.length + 
             this.state.giftsSelected.tier2.length + 
             this.state.giftsSelected.tier3.length;
    },

    // Create and display popup
    createPopup(tier, gifts, selectCount) {
      // Remove any existing popup
      this.closePopup();

      const popup = document.createElement('dialog');
      popup.className = 'tiered-gift-popup';
      popup.setAttribute('data-scroll-lock-required', '');
      
      const content = `
        <div class="gift-popup-overlay" data-popup-close></div>
        <div class="gift-popup-content">
          <button class="gift-popup-close" data-popup-close aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          
          <div class="gift-popup-header">
            <h2 class="gift-popup-title">
              ${tier === 3 ? '🎉 Congratulations! Free Shipping Unlocked!' : '🎁 You\'ve Unlocked Free Gifts!'}
            </h2>
            <p class="gift-popup-subtitle">
              ${selectCount === 1 ? 'Choose your free gift:' : `Choose ${selectCount} free gifts:`}
            </p>
          </div>

          <div class="gift-popup-products">
            ${gifts.map(gift => `
              <div class="gift-product-card" data-variant-id="${gift.id}">
                <div class="gift-product-image">
                  ${gift.image ? `<img src="${gift.image}" alt="${gift.title}">` : '<div class="gift-product-placeholder"></div>'}
                </div>
                <h3 class="gift-product-title">${gift.title}</h3>
                <button class="gift-product-select" data-gift-select="${gift.id}">
                  <span class="select-text">Select</span>
                  <span class="selected-text">Selected</span>
                </button>
              </div>
            `).join('')}
          </div>

          <div class="gift-popup-footer">
            <div class="gift-selection-counter">
              <span class="selection-count">0</span> of ${selectCount} selected
            </div>
            <div class="gift-popup-actions">
              <button class="gift-popup-skip" data-popup-skip>Skip</button>
              <button class="gift-popup-confirm" data-popup-confirm disabled>
                Add to Cart
              </button>
            </div>
          </div>

          ${tier === 3 ? '<div class="gift-popup-shipping">✨ Free shipping has been applied to your order!</div>' : ''}
        </div>
      `;

      popup.innerHTML = content;
      document.body.appendChild(popup);

      // Add event listeners
      this.attachPopupEvents(popup, tier, selectCount);

      // Show popup
      if (typeof popup.showModal === 'function') {
        popup.showModal();
      } else {
        popup.setAttribute('open', '');
      }

      // Lock scroll
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {
        detail: popup,
        bubbles: true
      }));

      // Add active class for animations
      setTimeout(() => {
        popup.classList.add('is-active');
      }, 10);
    },

    // Attach popup event handlers
    attachPopupEvents(popup, tier, maxSelection) {
      const selectedGifts = [];
      const selectButtons = popup.querySelectorAll('[data-gift-select]');
      const confirmButton = popup.querySelector('[data-popup-confirm]');
      const skipButton = popup.querySelector('[data-popup-skip]');
      const closeButtons = popup.querySelectorAll('[data-popup-close]');
      const counter = popup.querySelector('.selection-count');

      // Handle gift selection
      selectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const giftId = button.dataset.giftSelect;
          const card = button.closest('.gift-product-card');

          if (selectedGifts.includes(giftId)) {
            // Deselect
            const index = selectedGifts.indexOf(giftId);
            selectedGifts.splice(index, 1);
            card.classList.remove('is-selected');
          } else if (selectedGifts.length < maxSelection) {
            // Select
            selectedGifts.push(giftId);
            card.classList.add('is-selected');
          }

          // Update counter
          counter.textContent = selectedGifts.length;

          // Enable/disable confirm button
          confirmButton.disabled = selectedGifts.length === 0;
        });
      });

      // Handle confirm
      confirmButton.addEventListener('click', async (e) => {
        e.preventDefault();
        confirmButton.disabled = true;
        confirmButton.textContent = 'Adding...';

        // Add selected gifts to cart
        await this.addGiftsToCart(selectedGifts, tier);
        
        this.closePopup();
      });

      // Handle skip
      skipButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Save skip preference for this session
        sessionStorage.setItem(this.config.storage.skipSession, JSON.stringify({
          sessionId: this.state.sessionId,
          timestamp: Date.now()
        }));

        this.closePopup();
      });

      // Handle close
      closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.closePopup();
        });
      });

      // Close on escape
      popup.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closePopup();
        }
      });
    },

    // Add selected gifts to cart
    async addGiftsToCart(giftIds, tier) {
      // Store selected gifts in state
      if (tier === 1) {
        this.state.giftsSelected.tier1 = giftIds;
      } else if (tier === 2) {
        this.state.giftsSelected.tier2 = giftIds;
      } else if (tier === 3) {
        this.state.giftsSelected.tier3 = giftIds;
      }

      // Add gifts to cart with special properties
      for (const giftId of giftIds) {
        try {
          const formData = {
            id: parseInt(giftId),
            quantity: 1,
            properties: {
              '_gift_tier': tier,
              '_gift_item': 'true',
              '_gift_threshold': this.config.thresholds[`tier${tier}`]
            }
          };

          await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(formData)
          });
        } catch (e) {
          console.error('Failed to add gift to cart:', e);
        }
      }

      // Save state
      this.saveState();
      
      // Refresh cart display
      document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
    },

    // Remove all gift items from cart
    async removeAllGifts() {
      await this.removeGiftsFromCart([
        ...this.state.giftsSelected.tier1,
        ...this.state.giftsSelected.tier2,
        ...this.state.giftsSelected.tier3
      ]);

      // Reset state
      this.state.giftsSelected = { tier1: [], tier2: [], tier3: [] };
      this.state.thresholdsShown = { tier1: false, tier2: false, tier3: false };
      this.saveState();
    },

    // Remove gifts above a certain tier
    async removeGiftsAboveTier(maxTier) {
      const giftsToRemove = [];
      
      if (maxTier < 2) {
        giftsToRemove.push(...this.state.giftsSelected.tier2);
        this.state.giftsSelected.tier2 = [];
        this.state.thresholdsShown.tier2 = false;
      }
      
      if (maxTier < 3) {
        giftsToRemove.push(...this.state.giftsSelected.tier3);
        this.state.giftsSelected.tier3 = [];
        this.state.thresholdsShown.tier3 = false;
      }

      if (giftsToRemove.length > 0) {
        await this.removeGiftsFromCart(giftsToRemove);
        this.saveState();
      }
    },

    // Remove specific gifts from cart
    async removeGiftsFromCart(giftIds) {
      try {
        // Get current cart
        const response = await fetch('/cart.js');
        const cart = await response.json();

        // Find line items for gifts
        const updates = {};
        cart.items.forEach(item => {
          if (giftIds.includes(item.variant_id.toString()) && item.properties && item.properties._gift_item === 'true') {
            updates[item.variant_id] = 0;
          }
        });

        // Update cart
        if (Object.keys(updates).length > 0) {
          await fetch('/cart/update.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ updates })
          });

          // Refresh cart display
          document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
        }
      } catch (e) {
        console.error('Failed to remove gifts from cart:', e);
      }
    },

    // Close popup
    closePopup() {
      const popup = document.querySelector('.tiered-gift-popup');
      if (popup) {
        popup.classList.remove('is-active');
        
        // Unlock scroll
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
          detail: popup,
          bubbles: true
        }));

        // Remove after animation
        setTimeout(() => {
          popup.remove();
        }, 300);
      }

      this.state.isProcessing = false;
      
      // Update cart notification
      this.updateCartNotification();
    },

    // Inject cart notification HTML
    injectCartNotification() {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'tiered-gift-notification tw-mx-4 tw-mb-4';
      notification.id = 'tiered-gift-notification';
      notification.style.display = 'none';
      notification.innerHTML = `
        <div class="gift-notification-content tw-bg-gradient-to-r tw-from-amber-50 tw-to-orange-50 tw-border-2 tw-border-orange-500 tw-rounded-lg tw-p-4">
          <div class="tw-flex tw-items-center tw-gap-3">
            <div class="gift-notification-icon tw-text-3xl">🎁</div>
            <div class="gift-notification-text tw-flex-1">
              <span class="gift-notification-message tw-block tw-font-semibold tw-text-gray-800">You have free gifts available!</span>
              <span class="gift-notification-details tw-text-sm tw-text-gray-600"></span>
            </div>
            <button class="gift-notification-button tw-px-5 tw-py-2 tw-bg-orange-500 tw-text-white tw-rounded-md tw-font-semibold tw-hover:bg-orange-600 tw-transition-colors" data-open-gift-selection>
              Choose Gifts
            </button>
          </div>
        </div>
      `;
      
      // Add to body for global access
      document.body.appendChild(notification);
      
      // Listen for cart updates to show/hide notification
      document.addEventListener('theme:cart:change', () => this.updateCartNotification());
      document.addEventListener('theme:cart:refresh', () => this.updateCartNotification());
      document.addEventListener('theme:cart-drawer:open', () => {
        setTimeout(() => this.updateCartNotification(), 300);
      });
      
      // Also listen for Alpine.js cart updates (for 42 drawer)
      document.addEventListener('alpine:initialized', () => {
        if (window.Alpine && window.Alpine.store && window.Alpine.store('cart')) {
          // Watch for cart changes in Alpine
          setInterval(() => {
            const availableGifts = this.calculateAvailableGifts();
            if (availableGifts > 0) {
              this.updateCartNotification();
            }
          }, 2000); // Check every 2 seconds
        }
      });
      
      // Add click handler for the button
      notification.querySelector('[data-open-gift-selection]').addEventListener('click', (e) => {
        e.preventDefault();
        this.manuallyOpenGiftSelection();
      });
    },

    // Update cart notification visibility
    updateCartNotification() {
      const notification = document.getElementById('tiered-gift-notification');
      if (!notification) return;

      // Calculate available gifts
      const availableGifts = this.calculateAvailableGifts();
      
      if (availableGifts > 0) {
        // Show notification
        const details = notification.querySelector('.gift-notification-details');
        const message = notification.querySelector('.gift-notification-message');
        
        if (availableGifts === 1) {
          message.textContent = 'You have 1 free gift available!';
          details.textContent = 'Click to select your gift';
        } else {
          message.textContent = `You have ${availableGifts} free gifts available!`;
          details.textContent = `Click to select your ${availableGifts} gifts`;
        }
        
        notification.style.display = 'block';
        
        // Also inject into cart drawer and cart page if they exist
        // Use a small delay to ensure cart drawer is loaded
        setTimeout(() => {
          this.injectIntoCartUI(notification.cloneNode(true));
        }, 500);
      } else {
        // Hide notification
        notification.style.display = 'none';
        this.removeFromCartUI();
      }
    },

    // Calculate how many gifts are available but not selected
    calculateAvailableGifts() {
      // Get current cart total
      const cartTotal = this.state.lastCartTotal;
      
      // Determine eligible tier
      let eligibleGifts = 0;
      if (cartTotal >= this.config.thresholds.tier3) {
        eligibleGifts = 3;
      } else if (cartTotal >= this.config.thresholds.tier2) {
        eligibleGifts = 2;
      } else if (cartTotal >= this.config.thresholds.tier1) {
        eligibleGifts = 1;
      }
      
      // Count already selected gifts
      const selectedGifts = this.countSelectedGifts();
      
      // Return available gifts
      return Math.max(0, eligibleGifts - selectedGifts);
    },

    // Inject notification into cart UI elements
    injectIntoCartUI(notificationClone) {
      // Try to inject into 42-cart-drawer specifically
      // Look for the cart drawer content area
      const drawer42 = document.querySelector('[data-section-id*="42-cart-drawer"], [x-show="$store.cart.visible"]');
      if (drawer42) {
        const existingNotification = drawer42.querySelector('.tiered-gift-notification');
        if (!existingNotification) {
          // Find the content area specifically - look for the overflow container that has the items
          const contentArea = drawer42.querySelector('.tw-overflow-y-auto.custom-scroll');
          if (contentArea) {
            // Find the items container inside the content area
            const itemsContainer = contentArea.querySelector('[x-show="$store.cart.obj.item_count > 0"]');
            if (itemsContainer) {
              notificationClone.classList.add('in-cart-drawer');
              // Insert at the beginning of the items container
              itemsContainer.insertBefore(notificationClone, itemsContainer.firstChild);
              
              // Add event listener to cloned button
              notificationClone.querySelector('[data-open-gift-selection]').addEventListener('click', (e) => {
                e.preventDefault();
                this.manuallyOpenGiftSelection();
              });
            }
          }
        }
      }
      
      // Also try standard cart drawer selectors
      const cartDrawer = document.querySelector('cart-drawer, .cart-drawer, [data-cart-drawer]');
      if (cartDrawer && !drawer42) {
        const existingNotification = cartDrawer.querySelector('.tiered-gift-notification');
        if (!existingNotification) {
          const cartItems = cartDrawer.querySelector('[data-cart-items], .cart-items, cart-items');
          if (cartItems) {
            notificationClone.classList.add('in-cart-drawer');
            cartItems.parentNode.insertBefore(notificationClone, cartItems);
            
            // Add event listener to cloned button
            notificationClone.querySelector('[data-open-gift-selection]').addEventListener('click', (e) => {
              e.preventDefault();
              this.manuallyOpenGiftSelection();
            });
          }
        }
      }
      
      // Try to inject into cart page
      const cartPage = document.querySelector('[data-cart-page], .cart-page, #cart');
      if (cartPage) {
        const existingNotification = cartPage.querySelector('.tiered-gift-notification');
        if (!existingNotification) {
          const cartForm = cartPage.querySelector('form[action="/cart"]');
          if (cartForm) {
            notificationClone.classList.add('in-cart-page');
            cartForm.parentNode.insertBefore(notificationClone, cartForm);
            
            // Add event listener to cloned button
            notificationClone.querySelector('[data-open-gift-selection]').addEventListener('click', (e) => {
              e.preventDefault();
              this.manuallyOpenGiftSelection();
            });
          }
        }
      }
    },

    // Remove notification from cart UI elements
    removeFromCartUI() {
      document.querySelectorAll('.tiered-gift-notification.in-cart-drawer, .tiered-gift-notification.in-cart-page').forEach(el => {
        el.remove();
      });
    },

    // Manually open gift selection popup
    manuallyOpenGiftSelection() {
      // Calculate current tier and available gifts
      const cartTotal = this.state.lastCartTotal;
      let tier = 0;
      
      if (cartTotal >= this.config.thresholds.tier3) {
        tier = 3;
      } else if (cartTotal >= this.config.thresholds.tier2) {
        tier = 2;
      } else if (cartTotal >= this.config.thresholds.tier1) {
        tier = 1;
      }
      
      if (tier === 0) return; // No gifts available
      
      // Calculate gifts to select
      const totalAllowed = tier;
      const alreadySelected = this.countSelectedGifts();
      const toSelect = totalAllowed - alreadySelected;
      
      if (toSelect <= 0) return; // All gifts already selected
      
      // Get available gifts
      const availableGifts = this.getAvailableGifts(tier);
      
      // Create popup
      this.state.isProcessing = true;
      this.createPopup(tier, availableGifts, toSelect);
      
      // Don't update threshold shown state for manual opening
      this.saveState();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TieredGiftSystem.init());
  } else {
    TieredGiftSystem.init();
  }

  // Expose to global scope for debugging
  window.TieredGiftSystem = TieredGiftSystem;
})();