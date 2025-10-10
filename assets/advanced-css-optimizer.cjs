// Advanced CSS Optimization Script
const fs = require('fs');

function optimizeCSS(inputFile, outputFile) {
  let css = fs.readFileSync(inputFile, 'utf8');
  let originalSize = css.length;
  let removedRules = [];

  console.log('🔧 Starting advanced CSS optimization...');
  console.log(`   Original size: ${originalSize.toLocaleString()} bytes`);

  // 1. Remove redundant vendor prefixes for well-supported properties
  const modernOptimizations = [
    // Remove webkit prefix when standard property follows immediately
    {
      pattern: /-webkit-user-select:\s*none;\s*-moz-user-select:\s*none;\s*-ms-user-select:\s*none;\s*user-select:\s*none/g,
      replacement: 'user-select:none',
      reason: 'user-select well supported'
    },
    {
      pattern: /-webkit-appearance:\s*none;\s*-moz-appearance:\s*none;\s*appearance:\s*none/g,
      replacement: 'appearance:none',
      reason: 'appearance well supported'
    },
    {
      pattern: /-webkit-box-sizing:\s*border-box;\s*box-sizing:\s*border-box/g,
      replacement: 'box-sizing:border-box',
      reason: 'box-sizing standard since IE8'
    },
    {
      pattern: /-webkit-font-feature-settings:\s*normal;\s*font-feature-settings:\s*normal/g,
      replacement: 'font-feature-settings:normal',
      reason: 'font-feature-settings well supported'
    }
  ];

  modernOptimizations.forEach(opt => {
    const beforeLength = css.length;
    css = css.replace(opt.pattern, opt.replacement);
    if (css.length < beforeLength) {
      removedRules.push(`${opt.reason}: saved ${beforeLength - css.length} bytes`);
    }
  });

  // 2. Remove some obsolete webkit-specific properties that have no standard equivalent
  const obsoleteWebkitProperties = [
    '-webkit-tap-highlight-color: transparent;',
    '-webkit-font-smoothing: antialiased;',
    '-webkit-text-size-adjust: 100%;'
  ];

  // Keep these as they provide value for webkit browsers
  // obsoleteWebkitProperties.forEach(prop => {
  //   const beforeLength = css.length;
  //   css = css.replace(new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  //   if (css.length < beforeLength) {
  //     removedRules.push(`Removed obsolete: ${prop}`);
  //   }
  // });

  // 3. Clean up flexbox redundancy - remove old flexbox when new flexbox exists
  const flexboxCleanup = [
    {
      pattern: /display:\s*-webkit-box;\s*display:\s*-ms-flexbox;\s*display:\s*flex/g,
      replacement: 'display:flex',
      reason: 'flexbox cleanup'
    },
    {
      pattern: /-webkit-box-orient:\s*vertical;\s*-webkit-box-direction:\s*normal;\s*-ms-flex-direction:\s*column;\s*flex-direction:\s*column/g,
      replacement: 'flex-direction:column',
      reason: 'flex-direction cleanup'
    },
    {
      pattern: /-webkit-box-align:\s*center;\s*-ms-flex-align:\s*center;\s*align-items:\s*center/g,
      replacement: 'align-items:center',
      reason: 'align-items cleanup'
    },
    {
      pattern: /-webkit-box-pack:\s*center;\s*-ms-flex-pack:\s*center;\s*justify-content:\s*center/g,
      replacement: 'justify-content:center',
      reason: 'justify-content cleanup'
    }
  ];

  flexboxCleanup.forEach(cleanup => {
    const beforeLength = css.length;
    css = css.replace(cleanup.pattern, cleanup.replacement);
    if (css.length < beforeLength) {
      removedRules.push(`${cleanup.reason}: saved ${beforeLength - css.length} bytes`);
    }
  });

  // 4. Transform redundancy in transform properties
  const transformCleanup = [
    {
      pattern: /-webkit-transform:\s*([^;]+);\s*transform:\s*\1/g,
      replacement: 'transform:$1',
      reason: 'transform cleanup'
    },
    {
      pattern: /-webkit-transform-origin:\s*([^;]+);\s*transform-origin:\s*\1/g,
      replacement: 'transform-origin:$1',
      reason: 'transform-origin cleanup'
    }
  ];

  transformCleanup.forEach(cleanup => {
    const beforeLength = css.length;
    css = css.replace(cleanup.pattern, cleanup.replacement);
    if (css.length < beforeLength) {
      removedRules.push(`${cleanup.reason}: saved ${beforeLength - css.length} bytes`);
    }
  });

  // 5. Remove some unused Tailwind CSS variables (conservative approach)
  const tailwindVarsToRemove = [
    '--tw-content: "";',
    '--tw-space-y-reverse: 0;',
    '--tw-space-x-reverse: 0;',
    '--tw-translate-x: 0;',
    '--tw-translate-y: 0;',
    '--tw-rotate: 0;',
    '--tw-skew-x: 0;',
    '--tw-skew-y: 0;',
    '--tw-scale-x: 1;',
    '--tw-scale-y: 1;'
  ];

  // Only remove if they appear as standalone declarations
  tailwindVarsToRemove.forEach(varDecl => {
    const beforeLength = css.length;
    // Look for the variable as a standalone declaration
    const regex = new RegExp(varDecl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    css = css.replace(regex, '');
    if (css.length < beforeLength) {
      removedRules.push(`Removed unused Tailwind var: ${varDecl.split(':')[0]}`);
    }
  });

  // 6. Clean up whitespace and formatting for additional space savings
  css = css
    // Normalize spaces around brackets
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*}/g, '}')
    // Remove duplicate semicolons
    .replace(/;+/g, ';')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Remove spaces around colons in properties
    .replace(/:\s+/g, ':')
    // Remove trailing semicolons before closing braces
    .replace(/;\s*}/g, '}')
    // Clean up line breaks
    .replace(/\n\s*\n/g, '\n')
    .trim();

  const finalSize = css.length;
  const savings = originalSize - finalSize;
  const percentage = ((savings / originalSize) * 100).toFixed(2);

  console.log('\\n✅ Advanced CSS Optimization Complete:');
  console.log(`   Original size: ${originalSize.toLocaleString()} bytes`);
  console.log(`   Optimized size: ${finalSize.toLocaleString()} bytes`);
  console.log(`   Savings: ${savings.toLocaleString()} bytes (${percentage}%)`);
  console.log(`   Optimizations applied: ${removedRules.length}`);
  
  if (removedRules.length > 0) {
    console.log('\\n📋 Optimizations applied:');
    removedRules.forEach(rule => console.log(`     - ${rule}`));
  }

  fs.writeFileSync(outputFile, css);
  return { originalSize, finalSize, savings, percentage, removedRules };
}

// Run optimization
const inputFile = 'bundle-optimized.css';
const outputFile = 'bundle-advanced-optimized.css';

if (fs.existsSync(inputFile)) {
  optimizeCSS(inputFile, outputFile);
  console.log(`\\n🎯 Advanced optimized file saved as: ${outputFile}`);
} else {
  console.error('❌ bundle-optimized.css not found');
}