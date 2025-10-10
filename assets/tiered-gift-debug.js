/**
 * Tiered Gift System Debug Console
 * Advanced debugging tools for the tiered gift notification system
 */

(function() {
  'use strict';

  const TieredGiftDebugger = {
    // Debug configuration
    config: {
      enableLogging: true,
      visualHighlights: true,
      detailedInspection: true
    },

    // Initialize debugging tools
    init() {
      console.log("🔧 Tiered Gift Debugger Loaded");
      this.attachDebugCommands();
      this.setupDOMObservers();
      if (this.config.visualHighlights) {
        this.setupVisualDebugging();
      }
    },

    // Attach debug commands to window
    attachDebugCommands() {
      window.TieredGiftDebug = {
        // Core inspection
        inspect: () => this.inspectSystem(),
        dom: () => this.inspectDOM(),
        events: () => this.inspectEvents(),
        alpine: () => this.inspectAlpine(),
        
        // DOM testing
        findDrawer: () => this.findCartDrawer(),
        testInjection: () => this.testDOMInjection(),
        highlightTargets: () => this.highlightInjectionTargets(),
        
        // State manipulation
        simulate: (amount) => this.simulateCartTotal(amount),
        reset: () => this.resetState(),
        toggleNotification: () => this.toggleNotification(),
        
        // Advanced debugging
        monitor: () => this.startMonitoring(),
        stopMonitor: () => this.stopMonitoring(),
        trace: () => this.traceExecution()
      };

      console.log("🎛️ Debug commands attached to window.TieredGiftDebug");
      console.log("Available commands:", Object.keys(window.TieredGiftDebug));
    },

    // Comprehensive system inspection
    inspectSystem() {
      console.group("🔍 System Inspection");
      
      // Check core system
      const system = window.TieredGiftSystem;
      if (!system) {
        console.error("❌ TieredGiftSystem not found");
        return;
      }
      
      console.log("✅ TieredGiftSystem:", system);
      console.log("Current State:", system.state);
      console.log("Configuration:", system.config);
      console.log("Available Gifts:", system.calculateAvailableGifts());
      
      // Check Alpine.js
      const alpine = window.Alpine;
      if (alpine) {
        const cartStore = alpine.store('cart');
        console.log("✅ Alpine.js:", alpine);
        console.log("Cart Store:", cartStore?.obj);
      } else {
        console.error("❌ Alpine.js not found");
      }
      
      console.groupEnd();
    },

    // DOM structure inspection
    inspectDOM() {
      console.group("🌐 DOM Inspection");
      
      // Find notification element
      const notification = document.getElementById('tiered-gift-notification');
      console.log("Notification Element:", notification);
      
      if (notification) {
        console.log("  - Display:", notification.style.display);
        console.log("  - Classes:", notification.className);
        console.log("  - HTML:", notification.outerHTML.substring(0, 200) + "...");
      }
      
      // Find cart drawer
      const drawer = this.findCartDrawer();
      console.log("Cart Drawer:", drawer);
      
      if (drawer) {
        console.log("  - Data attributes:", this.getDataAttributes(drawer));
        console.log("  - Alpine directives:", this.getAlpineDirectives(drawer));
      }
      
      // Find injection targets
      const targets = this.findInjectionTargets();
      console.log("Injection Targets:", targets);
      
      console.groupEnd();
    },

    // Event listener inspection
    inspectEvents() {
      console.group("📡 Event Inspection");
      
      // List relevant event listeners
      const events = [
        'theme:cart:change',
        'theme:cart:refresh', 
        'theme:cart-drawer:open',
        'alpine:initialized',
        'cart:updated'
      ];
      
      events.forEach(eventType => {
        const listeners = this.getEventListeners(document, eventType);
        console.log(`${eventType}:`, listeners.length, 'listeners');
      });
      
      console.groupEnd();
    },

    // Alpine.js specific inspection  
    inspectAlpine() {
      console.group("⚡ Alpine.js Inspection");
      
      if (!window.Alpine) {
        console.error("❌ Alpine.js not available");
        console.groupEnd();
        return;
      }
      
      const alpine = window.Alpine;
      console.log("Alpine version:", alpine.version);
      
      // Inspect cart store
      const cartStore = alpine.store('cart');
      if (cartStore) {
        console.log("Cart Store Methods:", Object.keys(cartStore).filter(k => typeof cartStore[k] === 'function'));
        console.log("Cart Store Data:", {
          visible: cartStore.visible,
          itemCount: cartStore.obj?.item_count,
          totalPrice: cartStore.obj?.total_price
        });
      }
      
      // Find Alpine components
      const alpineElements = document.querySelectorAll('[x-data], [x-show], [x-if]');
      console.log("Alpine Elements Found:", alpineElements.length);
      
      console.groupEnd();
    },

    // Find cart drawer element
    findCartDrawer() {
      const selectors = [
        '[data-section-id*="42-cart-drawer"]',
        '[x-show="$store.cart.visible"]',
        'cart-drawer',
        '.cart-drawer',
        '[data-cart-drawer]'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`✅ Found cart drawer with selector: ${selector}`);
          return element;
        }
      }
      
      console.warn("⚠️ Cart drawer not found");
      return null;
    },

    // Find all potential injection targets
    findInjectionTargets() {
      const drawer = this.findCartDrawer();
      if (!drawer) return null;
      
      const targets = {
        contentArea: drawer.querySelector('.tw-overflow-y-auto.custom-scroll'),
        itemsContainer: drawer.querySelector('[x-show="$store.cart.obj.item_count > 0"]'),
        cartItems: drawer.querySelector('[data-cart-items], .cart-items, cart-items'),
        alternativeContainers: drawer.querySelectorAll('.tw-px-4, .tw-mx-4')
      };
      
      console.log("Injection Targets Found:");
      Object.entries(targets).forEach(([key, value]) => {
        console.log(`  ${key}:`, value ? "✅ Found" : "❌ Not found");
      });
      
      return targets;
    },

    // Test DOM injection
    testDOMInjection() {
      console.group("🧪 Testing DOM Injection");
      
      const targets = this.findInjectionTargets();
      if (!targets) {
        console.error("❌ No injection targets found");
        console.groupEnd();
        return;
      }
      
      // Create test element
      const testElement = document.createElement('div');
      testElement.className = 'tiered-gift-test-injection';
      testElement.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
      `;
      testElement.textContent = '🧪 TEST INJECTION - This element will be removed';
      
      // Test injection into primary target
      const primaryTarget = targets.itemsContainer || targets.contentArea;
      if (primaryTarget) {
        try {
          primaryTarget.insertBefore(testElement, primaryTarget.firstChild);
          console.log("✅ Successfully injected into primary target");
          
          // Remove after 3 seconds
          setTimeout(() => {
            testElement.remove();
            console.log("🧹 Test element removed");
          }, 3000);
          
        } catch (error) {
          console.error("❌ Injection failed:", error);
        }
      } else {
        console.error("❌ No suitable injection target found");
      }
      
      console.groupEnd();
    },

    // Highlight injection targets visually
    highlightInjectionTargets() {
      const targets = this.findInjectionTargets();
      if (!targets) return;
      
      // Remove existing highlights
      document.querySelectorAll('.debug-highlight').forEach(el => {
        el.classList.remove('debug-highlight');
        el.style.removeProperty('outline');
        el.style.removeProperty('background');
      });
      
      // Add highlights
      Object.entries(targets).forEach(([key, element]) => {
        if (element && element.nodeType === Node.ELEMENT_NODE) {
          element.classList.add('debug-highlight');
          element.style.outline = '2px solid #ff6b6b';
          element.style.background = 'rgba(255, 107, 107, 0.1)';
          
          // Add label
          const label = document.createElement('div');
          label.textContent = key;
          label.style.cssText = `
            position: absolute;
            top: -20px;
            left: 0;
            background: #ff6b6b;
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 3px;
            z-index: 9999;
          `;
          element.style.position = 'relative';
          element.appendChild(label);
        }
      });
      
      console.log("🎨 Injection targets highlighted");
      
      // Remove highlights after 10 seconds
      setTimeout(() => {
        document.querySelectorAll('.debug-highlight').forEach(el => {
          el.classList.remove('debug-highlight');
          el.style.removeProperty('outline');
          el.style.removeProperty('background');
          el.querySelector('div[style*="position: absolute"]')?.remove();
        });
        console.log("🧹 Highlights removed");
      }, 10000);
    },

    // Simulate cart total
    simulateCartTotal(amount) {
      if (!window.TieredGiftSystem) {
        console.error("❌ TieredGiftSystem not available");
        return;
      }
      
      const oldTotal = window.TieredGiftSystem.state.lastCartTotal;
      window.TieredGiftSystem.state.lastCartTotal = amount;
      window.TieredGiftSystem.updateCartNotification();
      
      console.log(`💰 Cart total changed: $${oldTotal/100} → $${amount/100}`);
      console.log(`🎁 Available gifts: ${window.TieredGiftSystem.calculateAvailableGifts()}`);
    },

    // Reset system state
    resetState() {
      if (!window.TieredGiftSystem) return;
      
      window.TieredGiftSystem.state.giftsSelected = { tier1: [], tier2: [], tier3: [] };
      window.TieredGiftSystem.state.thresholdsShown = { tier1: false, tier2: false, tier3: false };
      window.TieredGiftSystem.state.lastCartTotal = 0;
      window.TieredGiftSystem.updateCartNotification();
      
      console.log("🔄 System state reset");
    },

    // Toggle notification visibility
    toggleNotification() {
      const notification = document.getElementById('tiered-gift-notification');
      if (!notification) return;
      
      const isVisible = notification.style.display !== 'none';
      notification.style.display = isVisible ? 'none' : 'block';
      
      console.log(`👁️ Notification ${isVisible ? 'hidden' : 'shown'}`);
    },

    // Start monitoring system activity
    startMonitoring() {
      if (this.monitoring) {
        console.log("⚠️ Monitoring already active");
        return;
      }
      
      this.monitoring = true;
      console.log("🔍 Starting system monitoring...");
      
      // Monitor cart changes
      this.originalUpdateNotification = window.TieredGiftSystem?.updateCartNotification;
      if (this.originalUpdateNotification) {
        window.TieredGiftSystem.updateCartNotification = (...args) => {
          console.log("📡 updateCartNotification called");
          return this.originalUpdateNotification.apply(window.TieredGiftSystem, args);
        };
      }
      
      // Monitor threshold checks
      this.originalCheckThresholds = window.TieredGiftSystem?.checkThresholds;
      if (this.originalCheckThresholds) {
        window.TieredGiftSystem.checkThresholds = (total) => {
          console.log(`📊 checkThresholds called with: $${total/100}`);
          return this.originalCheckThresholds.call(window.TieredGiftSystem, total);
        };
      }
    },

    // Stop monitoring
    stopMonitoring() {
      if (!this.monitoring) return;
      
      this.monitoring = false;
      console.log("🛑 Stopping monitoring...");
      
      // Restore original functions
      if (this.originalUpdateNotification) {
        window.TieredGiftSystem.updateCartNotification = this.originalUpdateNotification;
      }
      
      if (this.originalCheckThresholds) {
        window.TieredGiftSystem.checkThresholds = this.originalCheckThresholds;
      }
    },

    // Trace execution flow
    traceExecution() {
      console.group("🔀 Execution Trace");
      
      const methods = [
        'updateCartNotification',
        'calculateAvailableGifts',
        'injectIntoCartUI',
        'checkThresholds',
        'manuallyOpenGiftSelection'
      ];
      
      methods.forEach(methodName => {
        const original = window.TieredGiftSystem?.[methodName];
        if (original && typeof original === 'function') {
          window.TieredGiftSystem[methodName] = function(...args) {
            console.log(`🔗 ${methodName}(${args.map(a => typeof a === 'object' ? '[Object]' : a).join(', ')})`);
            return original.apply(this, args);
          };
        }
      });
      
      console.log("✅ Execution tracing enabled for:", methods);
      console.groupEnd();
    },

    // Setup DOM observers
    setupDOMObservers() {
      // Observe cart drawer changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);
            
            // Check for cart drawer addition/removal
            addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  (node.matches('[data-section-id*="42-cart-drawer"]') || 
                   node.querySelector('[data-section-id*="42-cart-drawer"]'))) {
                console.log("🏗️ Cart drawer added to DOM");
              }
            });
          }
        });
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    },

    // Setup visual debugging CSS
    setupVisualDebugging() {
      const style = document.createElement('style');
      style.textContent = `
        .tiered-gift-notification {
          box-shadow: 0 0 10px rgba(255, 152, 0, 0.5) !important;
        }
        
        .debug-highlight {
          position: relative !important;
        }
        
        .debug-info {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 12px;
          z-index: 99999;
          max-width: 300px;
        }
      `;
      document.head.appendChild(style);
    },

    // Helper: Get data attributes
    getDataAttributes(element) {
      const attrs = {};
      for (let attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
          attrs[attr.name] = attr.value;
        }
      }
      return attrs;
    },

    // Helper: Get Alpine.js directives
    getAlpineDirectives(element) {
      const directives = {};
      for (let attr of element.attributes) {
        if (attr.name.startsWith('x-')) {
          directives[attr.name] = attr.value;
        }
      }
      return directives;
    },

    // Helper: Get event listeners (simplified)
    getEventListeners(element, eventType) {
      // Note: This is a simplified version as getEventListeners is Chrome DevTools specific
      const listeners = [];
      try {
        if (window.getEventListeners) {
          const allListeners = window.getEventListeners(element);
          listeners.push(...(allListeners[eventType] || []));
        }
      } catch (e) {
        // Fallback for browsers without getEventListeners
        listeners.push({ note: "getEventListeners not available" });
      }
      return listeners;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => TieredGiftDebugger.init(), 500);
    });
  } else {
    setTimeout(() => TieredGiftDebugger.init(), 500);
  }

  // Expose to global scope
  window.TieredGiftDebugger = TieredGiftDebugger;

})();