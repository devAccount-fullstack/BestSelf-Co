// Gift Product Handle Diagnostic Tool
// This script helps identify why product images aren't loading

(function() {
    console.log('🔍 Gift Product Handle Diagnostic Tool\n');
    console.log('=====================================\n');
    
    // Product handles to test
    const giftProducts = {
        tier1: [
            { handle: 'pomodoro-timer', title: 'Pomodoro Timer', id: '42128319643717' },
            { handle: 'highlighter-pen', title: 'Pen Highlighter', id: '42208958578757' },
            { handle: 'pocket-notes', title: 'Pocket Notes - Ideas', id: '42128400547909' }
        ],
        tier2: [
            { handle: 'little-talk-expansion', title: 'Little Talk Expansion', id: '40614671155269' },
            { handle: 'intimacy-deck-expansion', title: 'Intimacy Deck Expansion', id: '40709218172997' },
            { handle: 'end-of-year-review', title: 'End of Year Review', id: '32003212968005' }
        ],
        tier3: [
            { handle: 'gratitude-journal', title: 'Gratitude Journal', id: '31816763539525' },
            { handle: 'doodle-deck', title: 'Doodle Deck Bundle', id: '39585119273029' },
            { handle: 'date-deck', title: "It's A Date Deck", id: '40489789784133' }
        ]
    };
    
    // Test function
    async function testAllProducts() {
        const results = {
            working: [],
            notFound: [],
            noImage: []
        };
        
        console.log('Testing all gift product handles...\n');
        
        for (const [tier, products] of Object.entries(giftProducts)) {
            console.log(`\n📦 Testing ${tier.toUpperCase()} Products:`);
            console.log('----------------------------------------');
            
            for (const product of products) {
                try {
                    const response = await fetch(`/products/${product.handle}.js`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.featured_image) {
                            console.log(`✅ ${product.handle}`);
                            console.log(`   Title: ${data.title}`);
                            console.log(`   Image: ${data.featured_image}`);
                            console.log(`   Price: $${(data.price / 100).toFixed(2)}`);
                            results.working.push(product.handle);
                        } else {
                            console.warn(`⚠️ ${product.handle} - Found but NO IMAGE`);
                            console.log(`   Title: ${data.title}`);
                            results.noImage.push(product.handle);
                        }
                    } else {
                        console.error(`❌ ${product.handle} - NOT FOUND (${response.status})`);
                        console.log(`   Expected: "${product.title}"`);
                        results.notFound.push(product.handle);
                        
                        // Try to find the correct handle
                        await suggestCorrectHandle(product.title);
                    }
                } catch (error) {
                    console.error(`❌ ${product.handle} - ERROR: ${error.message}`);
                    results.notFound.push(product.handle);
                }
            }
        }
        
        // Summary
        console.log('\n\n📊 SUMMARY:');
        console.log('===========');
        console.log(`✅ Working: ${results.working.length} products`);
        if (results.working.length > 0) {
            console.log(`   ${results.working.join(', ')}`);
        }
        
        console.log(`⚠️ No Image: ${results.noImage.length} products`);
        if (results.noImage.length > 0) {
            console.log(`   ${results.noImage.join(', ')}`);
        }
        
        console.log(`❌ Not Found: ${results.notFound.length} products`);
        if (results.notFound.length > 0) {
            console.log(`   ${results.notFound.join(', ')}`);
        }
        
        return results;
    }
    
    // Helper function to suggest correct handles
    async function suggestCorrectHandle(productTitle) {
        console.log(`   🔍 Searching for: "${productTitle}"`);
        
        // Try different search terms
        const searchTerms = [
            productTitle,
            productTitle.split(' ')[0], // First word
            productTitle.replace(/expansion/i, ''), // Remove 'expansion'
            productTitle.replace(/['-]/g, ' ') // Replace special chars
        ];
        
        for (const term of searchTerms) {
            if (term.trim()) {
                try {
                    const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product&limit=5`);
                    const data = await response.json();
                    
                    if (data.resources?.results?.products?.length > 0) {
                        const matches = data.resources.results.products;
                        console.log(`   💡 Possible matches for "${term}":`);
                        
                        matches.forEach(p => {
                            // Extract handle from URL
                            const handle = p.url.split('/products/')[1]?.split('?')[0];
                            console.log(`      - ${handle}: ${p.title}`);
                        });
                        
                        break; // Stop after finding results
                    }
                } catch (e) {
                    // Search failed, continue
                }
            }
        }
    }
    
    // Alternative test using variant IDs
    async function testByVariantId(variantId) {
        try {
            // Add to cart to get product info
            const formData = new FormData();
            formData.append('items[0][id]', variantId);
            formData.append('items[0][quantity]', '0'); // Don't actually add
            
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Found product for variant ${variantId}:`, data);
                return data;
            }
        } catch (e) {
            console.error(`Failed to get product for variant ${variantId}:`, e);
        }
        return null;
    }
    
    // Export functions for manual use
    window.giftDiagnostics = {
        testAll: testAllProducts,
        suggestHandle: suggestCorrectHandle,
        testVariant: testByVariantId,
        
        // Quick fix function
        async findCorrectHandles() {
            console.log('\n🔧 Attempting to find correct handles automatically...\n');
            
            const corrections = {};
            
            for (const [tier, products] of Object.entries(giftProducts)) {
                for (const product of products) {
                    // Test current handle
                    const response = await fetch(`/products/${product.handle}.js`);
                    
                    if (!response.ok) {
                        console.log(`Finding correct handle for: ${product.title}`);
                        
                        // Try common variations
                        const variations = [
                            product.handle,
                            product.handle.replace('-', ''),
                            product.handle.replace(/-/g, '_'),
                            product.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                            product.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
                        ];
                        
                        for (const variant of variations) {
                            const testResponse = await fetch(`/products/${variant}.js`);
                            if (testResponse.ok) {
                                corrections[product.handle] = variant;
                                console.log(`   ✅ Found: ${variant}`);
                                break;
                            }
                        }
                        
                        if (!corrections[product.handle]) {
                            console.log(`   ❌ Could not find correct handle`);
                        }
                    }
                }
            }
            
            if (Object.keys(corrections).length > 0) {
                console.log('\n📝 Suggested corrections:');
                console.log('Copy these to update tiered-gift-system.js:');
                console.log(JSON.stringify(corrections, null, 2));
            }
            
            return corrections;
        }
    };
    
    // Auto-run the test
    testAllProducts().then(() => {
        console.log('\n\n💡 To find correct handles automatically, run:');
        console.log('   giftDiagnostics.findCorrectHandles()');
        console.log('\n💡 To test a specific variant ID, run:');
        console.log('   giftDiagnostics.testVariant("42128319643717")');
    });
})();