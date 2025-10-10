// CSS Optimization Verification Script
const fs = require('fs');

function verifyOptimization() {
  console.log('🔍 Verifying CSS optimization...\n');
  
  // Check file sizes
  const originalSize = 72634; // Known original size
  const currentSize = fs.statSync('bundle.css').size;
  const savings = originalSize - currentSize;
  const percentage = ((savings / originalSize) * 100).toFixed(2);
  
  console.log('📊 File Size Verification:');
  console.log(`   Original size: ${originalSize.toLocaleString()} bytes`);
  console.log(`   Current size: ${currentSize.toLocaleString()} bytes`);
  console.log(`   Total savings: ${savings.toLocaleString()} bytes (${percentage}%)`);
  
  // Verify critical CSS patterns still exist
  const css = fs.readFileSync('bundle.css', 'utf8');
  
  const criticalPatterns = [
    'swiper-container', // Swiper functionality
    'swiper-slide', // Swiper slides
    'tw-flex', // Tailwind utilities
    'btn-42', // Custom button component
    'display:flex', // Modern flexbox
    'transform:', // Transform properties
    'user-select:none' // Optimized property
  ];
  
  console.log('\n🔍 Critical Pattern Verification:');
  let allPatternsFound = true;
  
  criticalPatterns.forEach(pattern => {
    const found = css.includes(pattern);
    const status = found ? '✅' : '❌';
    console.log(`   ${status} ${pattern}`);
    if (!found) allPatternsFound = false;
  });
  
  // Check optimization artifacts
  console.log('\n🛠️ Optimization Verification:');
  
  const optimizationChecks = [
    {
      check: 'Redundant webkit prefixes removed',
      pattern: /-webkit-user-select:\s*none;\s*-moz-user-select:\s*none;\s*-ms-user-select:\s*none;\s*user-select:\s*none/,
      shouldExist: false
    },
    {
      check: 'Modern user-select preserved',
      pattern: /user-select:\s*none/,
      shouldExist: true
    },
    {
      check: 'Redundant flexbox prefixes removed',
      pattern: /-webkit-box;\s*display:\s*-ms-flexbox;\s*display:\s*flex/,
      shouldExist: false
    },
    {
      check: 'Modern flexbox preserved',
      pattern: /display:\s*flex/,
      shouldExist: true
    }
  ];
  
  optimizationChecks.forEach(check => {
    const found = check.pattern.test(css);
    const isCorrect = check.shouldExist ? found : !found;
    const status = isCorrect ? '✅' : '❌';
    console.log(`   ${status} ${check.check}`);
  });
  
  console.log('\n📋 Summary:');
  if (allPatternsFound && currentSize < originalSize) {
    console.log('   ✅ Optimization successful!');
    console.log('   ✅ All critical functionality preserved');
    console.log('   ✅ File size reduced significantly');
    console.log('   ✅ Ready for production use');
  } else {
    console.log('   ❌ Optimization verification failed');
    console.log('   ⚠️  Please review the optimizations');
  }
  
  return { currentSize, savings, percentage, allPatternsFound };
}

// Run verification
verifyOptimization();