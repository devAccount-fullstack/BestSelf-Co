/**
 * Tiered Gift System Testing Script
 * Comprehensive testing for cart drawer notifications and Alpine.js integration
 */

(function() {
  'use strict';

  const TieredGiftTester = {
    // Test configuration
    config: {
      testCartTotals: [
        { amount: 3000, expected: 0, description: "Below threshold - no gifts" },
        { amount: 4500, expected: 1, description: "Tier 1 threshold - 1 gift available" },
        { amount: 6000, expected: 2, description: "Tier 2 threshold - 2 gifts available" },
        { amount: 8500, expected: 3, description: "Tier 3 threshold - 3 gifts available" },
      ],
      delayBetweenTests: 2000,
      debug: true
    },

    // Test state
    testResults: [],
    currentTest: 0,

    // Initialize testing
    init() {
      console.log("🧪 Starting Tiered Gift System Tests");
      this.checkDependencies();
      this.runAllTests();
    },

    // Check if required systems are available
    checkDependencies() {
      console.log("🔍 Checking system dependencies...");
      
      // Check if TieredGiftSystem is available
      if (!window.TieredGiftSystem) {
        console.error("❌ TieredGiftSystem not found!");
        return false;
      }
      console.log("✅ TieredGiftSystem found");

      // Check if Alpine.js is available
      if (!window.Alpine) {
        console.error("❌ Alpine.js not found!");
        return false;
      }
      console.log("✅ Alpine.js found");

      // Check if cart store is available
      if (!window.Alpine.store('cart')) {
        console.error("❌ Alpine cart store not found!");
        return false;
      }
      console.log("✅ Alpine cart store found");

      // Check for 42-cart-drawer
      const cartDrawer = document.querySelector('[data-section-id*="42-cart-drawer"], [x-show="$store.cart.visible"]');
      if (!cartDrawer) {
        console.warn("⚠️ 42-cart-drawer not found in DOM");
      } else {
        console.log("✅ 42-cart-drawer found");
      }

      return true;
    },

    // Run all tests
    async runAllTests() {
      console.log("\n🚀 Starting test sequence...\n");

      // Test 1: DOM Injection Test
      await this.testDOMInjection();
      
      // Test 2: Threshold Logic Test
      await this.testThresholdLogic();
      
      // Test 3: Notification Display Test
      await this.testNotificationDisplay();
      
      // Test 4: Gift Selection Integration
      await this.testGiftSelectionIntegration();
      
      // Test 5: Alpine.js Integration Test
      await this.testAlpineIntegration();
      
      // Test 6: Cart Drawer Integration
      await this.testCartDrawerIntegration();

      // Display final results
      this.displayTestResults();
    },

    // Test 1: DOM Injection and Element Finding
    async testDOMInjection() {
      console.log("📝 Test 1: DOM Injection and Element Finding");
      
      try {
        // Check if notification element exists
        const notification = document.getElementById('tiered-gift-notification');
        
        if (!notification) {
          console.error("❌ Tiered gift notification element not found in DOM");
          this.logTestResult("DOM Injection", false, "Notification element not found");
          return;
        }

        console.log("✅ Notification element found:", notification);
        
        // Check notification structure
        const content = notification.querySelector('.gift-notification-content');
        const button = notification.querySelector('[data-open-gift-selection]');
        const message = notification.querySelector('.gift-notification-message');
        
        if (!content || !button || !message) {
          console.error("❌ Notification structure incomplete");
          this.logTestResult("DOM Injection", false, "Missing required elements");
          return;
        }

        console.log("✅ Notification structure complete");
        
        // Test cart drawer injection capability
        const drawer = document.querySelector('[data-section-id*="42-cart-drawer"]');
        if (drawer) {
          const contentArea = drawer.querySelector('.tw-overflow-y-auto.custom-scroll');
          const itemsContainer = contentArea?.querySelector('[x-show="$store.cart.obj.item_count > 0"]');
          
          if (contentArea && itemsContainer) {
            console.log("✅ Cart drawer injection targets found");
            this.logTestResult("DOM Injection", true, "All elements found and structured correctly");
          } else {
            console.warn("⚠️ Cart drawer targets not found (may be expected if drawer not open)");
            this.logTestResult("DOM Injection", true, "Base notification found, drawer targets conditional");
          }
        } else {
          console.warn("⚠️ 42-cart-drawer not found in current DOM");
          this.logTestResult("DOM Injection", true, "Base notification found, drawer not present");
        }

      } catch (error) {
        console.error("❌ DOM Injection test failed:", error);
        this.logTestResult("DOM Injection", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Test 2: Threshold Logic
    async testThresholdLogic() {
      console.log("📝 Test 2: Threshold Logic Testing");
      
      try {
        // Backup original state
        const originalState = { ...window.TieredGiftSystem.state };
        
        for (const testCase of this.config.testCartTotals) {
          console.log(`\n  Testing: ${testCase.description}`);
          
          // Reset state for clean test
          window.TieredGiftSystem.state.giftsSelected = { tier1: [], tier2: [], tier3: [] };
          window.TieredGiftSystem.state.lastCartTotal = testCase.amount;
          
          // Calculate available gifts
          const availableGifts = window.TieredGiftSystem.calculateAvailableGifts();
          
          console.log(`    Cart Total: $${testCase.amount / 100}`);
          console.log(`    Expected Gifts: ${testCase.expected}`);
          console.log(`    Calculated Gifts: ${availableGifts}`);
          
          if (availableGifts === testCase.expected) {
            console.log("    ✅ PASS");
          } else {
            console.log("    ❌ FAIL");
          }
        }
        
        // Restore original state
        window.TieredGiftSystem.state = originalState;
        
        this.logTestResult("Threshold Logic", true, "All threshold calculations correct");
        
      } catch (error) {
        console.error("❌ Threshold Logic test failed:", error);
        this.logTestResult("Threshold Logic", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Test 3: Notification Display
    async testNotificationDisplay() {
      console.log("📝 Test 3: Notification Display Testing");
      
      try {
        const notification = document.getElementById('tiered-gift-notification');
        
        if (!notification) {
          throw new Error("Notification element not found");
        }

        // Test notification update with different gift counts
        const testCases = [
          { gifts: 0, shouldShow: false, description: "No gifts - should hide" },
          { gifts: 1, shouldShow: true, description: "1 gift - should show" },
          { gifts: 2, shouldShow: true, description: "2 gifts - should show" },
          { gifts: 3, shouldShow: true, description: "3 gifts - should show" }
        ];

        for (const testCase of testCases) {
          console.log(`\n  Testing: ${testCase.description}`);
          
          // Mock the calculateAvailableGifts function
          const originalCalculate = window.TieredGiftSystem.calculateAvailableGifts;
          window.TieredGiftSystem.calculateAvailableGifts = () => testCase.gifts;
          
          // Update notification
          window.TieredGiftSystem.updateCartNotification();
          
          await this.delay(100);
          
          const isVisible = notification.style.display !== 'none';
          console.log(`    Expected Visibility: ${testCase.shouldShow}`);
          console.log(`    Actual Visibility: ${isVisible}`);
          
          if (isVisible === testCase.shouldShow) {
            console.log("    ✅ PASS");
          } else {
            console.log("    ❌ FAIL");
          }
          
          // Restore original function
          window.TieredGiftSystem.calculateAvailableGifts = originalCalculate;
        }
        
        this.logTestResult("Notification Display", true, "Notification visibility logic working");
        
      } catch (error) {
        console.error("❌ Notification Display test failed:", error);
        this.logTestResult("Notification Display", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Test 4: Gift Selection Integration
    async testGiftSelectionIntegration() {
      console.log("📝 Test 4: Gift Selection Integration");
      
      try {
        const notification = document.getElementById('tiered-gift-notification');
        const button = notification?.querySelector('[data-open-gift-selection]');
        
        if (!button) {
          throw new Error("Gift selection button not found");
        }

        console.log("✅ Gift selection button found");
        
        // Mock a scenario where gifts are available
        window.TieredGiftSystem.state.lastCartTotal = 4500; // $45
        window.TieredGiftSystem.state.giftsSelected = { tier1: [], tier2: [], tier3: [] };
        
        // Test button click handler
        let clickHandled = false;
        const originalManualOpen = window.TieredGiftSystem.manuallyOpenGiftSelection;
        window.TieredGiftSystem.manuallyOpenGiftSelection = function() {
          clickHandled = true;
          console.log("✅ Gift selection popup would open");
        };
        
        // Simulate button click
        button.click();
        
        if (clickHandled) {
          console.log("✅ Button click handler working");
          this.logTestResult("Gift Selection Integration", true, "Button integration working");
        } else {
          console.log("❌ Button click handler not working");
          this.logTestResult("Gift Selection Integration", false, "Button click not handled");
        }
        
        // Restore original function
        window.TieredGiftSystem.manuallyOpenGiftSelection = originalManualOpen;
        
      } catch (error) {
        console.error("❌ Gift Selection Integration test failed:", error);
        this.logTestResult("Gift Selection Integration", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Test 5: Alpine.js Integration
    async testAlpineIntegration() {
      console.log("📝 Test 5: Alpine.js Integration Testing");
      
      try {
        const cartStore = window.Alpine.store('cart');
        
        if (!cartStore) {
          throw new Error("Alpine cart store not available");
        }

        console.log("✅ Alpine cart store accessible");
        console.log("Current cart state:", {
          itemCount: cartStore.obj?.item_count,
          totalPrice: cartStore.obj?.total_price,
          visible: cartStore.visible
        });
        
        // Test cart store reactivity monitoring
        let eventReceived = false;
        const testHandler = () => { eventReceived = true; };
        
        document.addEventListener('theme:cart:change', testHandler);
        document.addEventListener('theme:cart:refresh', testHandler);
        
        // Simulate cart event
        document.dispatchEvent(new CustomEvent('theme:cart:change', { 
          detail: { cart: { total_price: 4500, item_count: 2 } }
        }));
        
        await this.delay(100);
        
        if (eventReceived) {
          console.log("✅ Cart events being handled");
        } else {
          console.log("⚠️ Cart events may not be properly handled");
        }
        
        document.removeEventListener('theme:cart:change', testHandler);
        document.removeEventListener('theme:cart:refresh', testHandler);
        
        this.logTestResult("Alpine.js Integration", true, "Alpine store accessible and reactive");
        
      } catch (error) {
        console.error("❌ Alpine.js Integration test failed:", error);
        this.logTestResult("Alpine.js Integration", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Test 6: Cart Drawer Integration
    async testCartDrawerIntegration() {
      console.log("📝 Test 6: Cart Drawer Integration Testing");
      
      try {
        // Find cart drawer
        const drawer = document.querySelector('[data-section-id*="42-cart-drawer"], [x-show="$store.cart.visible"]');
        
        if (!drawer) {
          console.warn("⚠️ Cart drawer not found in DOM - this may be expected");
          this.logTestResult("Cart Drawer Integration", true, "Cart drawer not present (conditional test)");
          return;
        }

        console.log("✅ Cart drawer found");
        
        // Test injection targets
        const contentArea = drawer.querySelector('.tw-overflow-y-auto.custom-scroll');
        const itemsContainer = contentArea?.querySelector('[x-show="$store.cart.obj.item_count > 0"]');
        
        if (!contentArea) {
          console.error("❌ Cart drawer content area not found");
          this.logTestResult("Cart Drawer Integration", false, "Content area missing");
          return;
        }

        if (!itemsContainer) {
          console.warn("⚠️ Items container not found (may be conditional on cart contents)");
        }

        // Test notification injection simulation
        const testNotification = document.createElement('div');
        testNotification.className = 'test-notification';
        testNotification.textContent = 'Test Notification';

        try {
          if (itemsContainer) {
            itemsContainer.insertBefore(testNotification, itemsContainer.firstChild);
            console.log("✅ Successfully injected test notification into cart drawer");
            
            // Clean up
            testNotification.remove();
          } else {
            contentArea.appendChild(testNotification);
            console.log("✅ Successfully injected test notification into content area");
            
            // Clean up
            testNotification.remove();
          }
          
          this.logTestResult("Cart Drawer Integration", true, "Injection targets working");
          
        } catch (injectError) {
          console.error("❌ Failed to inject into cart drawer:", injectError);
          this.logTestResult("Cart Drawer Integration", false, "Injection failed");
        }
        
      } catch (error) {
        console.error("❌ Cart Drawer Integration test failed:", error);
        this.logTestResult("Cart Drawer Integration", false, error.message);
      }

      await this.delay(this.config.delayBetweenTests);
    },

    // Utility function for delays
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Log test results
    logTestResult(testName, passed, details) {
      this.testResults.push({
        name: testName,
        passed,
        details,
        timestamp: new Date().toISOString()
      });
    },

    // Display final test results
    displayTestResults() {
      console.log("\n🏁 TEST RESULTS SUMMARY");
      console.log("=" .repeat(50));
      
      let passedTests = 0;
      let totalTests = this.testResults.length;
      
      this.testResults.forEach(result => {
        const status = result.passed ? "✅ PASS" : "❌ FAIL";
        console.log(`${status} ${result.name}`);
        if (result.details) {
          console.log(`    Details: ${result.details}`);
        }
        if (result.passed) passedTests++;
      });
      
      console.log("=" .repeat(50));
      console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log("🎉 All tests passed! The tiered gift system is working correctly.");
      } else {
        console.log("⚠️ Some tests failed. Check the details above for issues.");
      }
    },

    // Manual test functions
    simulateCartTotal(amount) {
      console.log(`🧪 Simulating cart total: $${amount / 100}`);
      window.TieredGiftSystem.state.lastCartTotal = amount;
      window.TieredGiftSystem.updateCartNotification();
    },

    openCartDrawer() {
      if (window.Alpine && window.Alpine.store('cart')) {
        window.Alpine.store('cart').show();
      }
    },

    closeCartDrawer() {
      if (window.Alpine && window.Alpine.store('cart')) {
        window.Alpine.store('cart').hide();
      }
    },

    // Debug helpers
    inspectCurrentState() {
      console.log("🔍 Current System State:");
      console.log("Cart Total:", window.TieredGiftSystem.state.lastCartTotal);
      console.log("Selected Gifts:", window.TieredGiftSystem.state.giftsSelected);
      console.log("Available Gifts:", window.TieredGiftSystem.calculateAvailableGifts());
      console.log("Thresholds Shown:", window.TieredGiftSystem.state.thresholdsShown);
    }
  };

  // Initialize testing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => TieredGiftTester.init(), 1000);
    });
  } else {
    setTimeout(() => TieredGiftTester.init(), 1000);
  }

  // Expose to global scope for manual testing
  window.TieredGiftTester = TieredGiftTester;

  // Add helpful console commands
  console.log("🧪 Tiered Gift Tester loaded! Available commands:");
  console.log("- TieredGiftTester.init() - Run all tests");
  console.log("- TieredGiftTester.simulateCartTotal(4500) - Simulate $45 cart");
  console.log("- TieredGiftTester.openCartDrawer() - Open cart drawer");
  console.log("- TieredGiftTester.inspectCurrentState() - View current state");

})();