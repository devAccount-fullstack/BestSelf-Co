// Quick Notification Checker for Tiered Gift System
// Run this in the browser console to verify the notification is working

(function() {
    console.log('🔍 Checking Tiered Gift Notification in Cart Drawer...\n');
    
    // Step 1: Check if the tiered gift system is loaded
    if (typeof window.tieredGiftSystem === 'undefined') {
        console.error('❌ Tiered Gift System not loaded! Check that tiered-gift-system.js is included.');
        return;
    }
    console.log('✅ Tiered Gift System is loaded');
    
    // Step 2: Check current cart total
    const cartTotal = window.tieredGiftSystem.state.lastCartTotal;
    console.log(`💰 Current cart total: $${(cartTotal / 100).toFixed(2)}`);
    
    // Step 3: Check gift thresholds
    const thresholds = window.tieredGiftSystem.config.thresholds;
    console.log(`📊 Gift thresholds:
    - Tier 1: $${(thresholds.tier1 / 100).toFixed(2)}
    - Tier 2: $${(thresholds.tier2 / 100).toFixed(2)}
    - Tier 3: $${(thresholds.tier3 / 100).toFixed(2)}`);
    
    // Step 4: Calculate available gifts
    const availableGifts = window.tieredGiftSystem.calculateAvailableGifts();
    console.log(`🎁 Available gifts to select: ${availableGifts}`);
    
    // Step 5: Check if notification exists in DOM
    const globalNotification = document.getElementById('tiered-gift-notification');
    if (globalNotification) {
        console.log('✅ Global notification element exists');
        console.log(`   Display: ${globalNotification.style.display}`);
    } else {
        console.error('❌ Global notification element not found!');
    }
    
    // Step 6: Check for cart drawer
    const cartDrawer = document.querySelector('[x-show="$store.cart.visible"]');
    if (cartDrawer) {
        console.log('✅ Cart drawer found');
        
        // Check if notification is in cart drawer
        const drawerNotification = cartDrawer.querySelector('.tiered-gift-notification');
        if (drawerNotification) {
            console.log('✅ Notification is in cart drawer!');
            console.log(`   Classes: ${drawerNotification.className}`);
            
            // Check if button works
            const button = drawerNotification.querySelector('[data-open-gift-selection]');
            if (button) {
                console.log('✅ "Choose Gifts" button found');
                console.log('   You can click it to open the gift selection popup');
            }
        } else {
            console.warn('⚠️ Notification not found in cart drawer');
            console.log('   Attempting to inject notification...');
            
            // Try to manually trigger injection
            window.tieredGiftSystem.updateCartNotification();
            
            setTimeout(() => {
                const retryNotification = cartDrawer.querySelector('.tiered-gift-notification');
                if (retryNotification) {
                    console.log('✅ Notification successfully injected!');
                } else {
                    console.error('❌ Failed to inject notification');
                    console.log('   Checking target elements...');
                    
                    const contentArea = cartDrawer.querySelector('.tw-overflow-y-auto.custom-scroll');
                    const itemsContainer = contentArea?.querySelector('[x-show="$store.cart.obj.item_count > 0"]');
                    
                    console.log(`   Content area found: ${!!contentArea}`);
                    console.log(`   Items container found: ${!!itemsContainer}`);
                }
            }, 1000);
        }
    } else {
        console.log('ℹ️ Cart drawer is not open. Open it to see the notification.');
        console.log('   Try: Alpine.store("cart").show()');
    }
    
    // Step 7: Provide manual test commands
    console.log('\n📝 Manual Test Commands:');
    console.log('1. Open cart drawer: Alpine.store("cart").show()');
    console.log('2. Simulate $45 threshold: window.tieredGiftSystem.state.lastCartTotal = 4500; window.tieredGiftSystem.updateCartNotification();');
    console.log('3. Simulate $60 threshold: window.tieredGiftSystem.state.lastCartTotal = 6000; window.tieredGiftSystem.updateCartNotification();');
    console.log('4. Open gift selection manually: window.tieredGiftSystem.manuallyOpenGiftSelection()');
    console.log('5. Check available gifts: window.tieredGiftSystem.calculateAvailableGifts()');
})();