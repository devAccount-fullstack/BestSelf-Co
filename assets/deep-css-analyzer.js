const fs = require('fs');
const path = require('path');

// Deep CSS analysis for advanced optimization opportunities
class DeepCSSAnalyzer {
  constructor() {
    this.unusedWebkitPrefixes = [];
    this.unusedCSSVariables = [];
    this.duplicateRules = [];
    this.obsoleteFeatures = [];
    this.redundantRules = [];
  }

  // Webkit prefixes that are now obsolete for modern browsers (2020+)
  getObsoleteWebkitPrefixes() {
    return [
      '-webkit-border-radius', // Standard since IE9
      '-webkit-box-shadow', // Standard since IE9
      '-webkit-linear-gradient', // Standard since IE10
      '-webkit-radial-gradient', // Standard since IE10
      '-webkit-background-size', // Standard since IE9
      '-webkit-transition', // Standard since IE10
      '-webkit-animation', // Standard since IE10
      '-webkit-transform', // Standard since IE9
      '-webkit-opacity', // Never needed prefix
      '-webkit-text-shadow', // Standard since IE10
      '-webkit-border-image', // Standard since IE11
    ];
  }

  // Modern CSS properties that don't need prefixes
  getModernCSSFeatures() {
    return {
      'flexbox': ['-webkit-box', '-ms-flexbox'],
      'grid': ['-ms-grid'],
      'transforms': ['-webkit-transform'],
      'transitions': ['-webkit-transition'],
      'animations': ['-webkit-animation'],
      'appearance': ['-webkit-appearance', '-moz-appearance']
    };
  }

  analyzeCSS(cssContent) {
    const analysis = {
      webkitPrefixes: [],
      cssVariables: [],
      duplicates: [],
      obsoletePrefixes: [],
      optimizationOpportunities: [],
      estimatedSavings: 0
    };

    // Find all webkit prefixes
    const webkitRegex = /-webkit-[\w-]+/g;
    const webkitMatches = cssContent.match(webkitRegex) || [];
    analysis.webkitPrefixes = [...new Set(webkitMatches)];

    // Find CSS variables
    const cssVarRegex = /--[\w-]+/g;
    const cssVarMatches = cssContent.match(cssVarRegex) || [];
    analysis.cssVariables = [...new Set(cssVarMatches)];

    // Check for obsolete webkit prefixes
    const obsoletePrefixes = this.getObsoleteWebkitPrefixes();
    analysis.obsoletePrefixes = analysis.webkitPrefixes.filter(prefix => {
      return obsoletePrefixes.some(obsolete => prefix.includes(obsolete.replace('-webkit-', '')));
    });

    // Find duplicate CSS rules (simplified)
    analysis.duplicates = this.findDuplicateRules(cssContent);

    // Find unused Tailwind CSS variables
    analysis.unusedTailwindVars = this.findUnusedTailwindVars(cssContent);

    // Calculate potential savings
    analysis.estimatedSavings = this.calculateSavings(cssContent, analysis);

    return analysis;
  }

  findDuplicateRules(cssContent) {
    const duplicates = [];
    const rules = {};
    
    // Simple regex to match CSS rules (not perfect but good for basic detection)
    const ruleRegex = /([^{]+)\s*{([^}]+)}/g;
    let match;
    
    while ((match = ruleRegex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();
      const key = `${selector}::${properties}`;
      
      if (rules[key]) {
        rules[key].count++;
        if (rules[key].count === 2) {
          duplicates.push({
            selector,
            properties,
            count: rules[key].count
          });
        }
      } else {
        rules[key] = { count: 1, selector, properties };
      }
    }
    
    return duplicates;
  }

  findUnusedTailwindVars(cssContent) {
    const unusedVars = [];
    const definedVars = new Set();
    const usedVars = new Set();

    // Find all defined CSS variables
    const defineRegex = /--([\w-]+):\s*[^;]+/g;
    let match;
    while ((match = defineRegex.exec(cssContent)) !== null) {
      definedVars.add(`--${match[1]}`);
    }

    // Find all used CSS variables
    const useRegex = /var\(--([\w-]+)/g;
    while ((match = useRegex.exec(cssContent)) !== null) {
      usedVars.add(`--${match[1]}`);
    }

    // Find unused variables
    for (const definedVar of definedVars) {
      if (!usedVars.has(definedVar)) {
        unusedVars.push(definedVar);
      }
    }

    return unusedVars;
  }

  calculateSavings(cssContent, analysis) {
    let estimatedBytes = 0;
    
    // Estimate savings from removing obsolete prefixes
    analysis.obsoletePrefixes.forEach(prefix => {
      const regex = new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = cssContent.match(regex) || [];
      estimatedBytes += matches.length * prefix.length;
    });

    // Estimate savings from removing unused CSS variables
    analysis.unusedTailwindVars.forEach(varName => {
      const regex = new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':[^;]+;', 'g');
      const matches = cssContent.match(regex) || [];
      matches.forEach(match => estimatedBytes += match.length);
    });

    // Estimate savings from duplicate removal
    analysis.duplicates.forEach(duplicate => {
      const ruleSize = duplicate.selector.length + duplicate.properties.length + 3; // +3 for {}
      estimatedBytes += ruleSize * (duplicate.count - 1);
    });

    return estimatedBytes;
  }

  generateOptimizationScript(analysis) {
    let script = `// Advanced CSS Optimization Script
const fs = require('fs');

function optimizeCSS(inputFile, outputFile) {
  let css = fs.readFileSync(inputFile, 'utf8');
  let originalSize = css.length;
  let removedRules = [];

`;

    // Add obsolete prefix removal
    if (analysis.obsoletePrefixes.length > 0) {
      script += `
  // Remove obsolete webkit prefixes that are no longer needed
  const obsoletePrefixes = ${JSON.stringify(analysis.obsoletePrefixes, null, 2)};
  
  obsoletePrefixes.forEach(prefix => {
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp(escapedPrefix + '[^;]*;?\\\\s*', 'g');
    const beforeLength = css.length;
    css = css.replace(regex, '');
    if (css.length < beforeLength) {
      removedRules.push(\`Removed obsolete prefix: \${prefix}\`);
    }
  });
`;
    }

    // Add unused CSS variable removal
    if (analysis.unusedTailwindVars.length > 0) {
      script += `
  // Remove unused CSS variables (first 50 to be safe)
  const unusedVars = ${JSON.stringify(analysis.unusedTailwindVars.slice(0, 50), null, 2)};
  
  unusedVars.forEach(varName => {
    const escapedVar = varName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp(escapedVar + ':[^;]+;\\\\s*', 'g');
    const beforeLength = css.length;
    css = css.replace(regex, '');
    if (css.length < beforeLength) {
      removedRules.push(\`Removed unused variable: \${varName}\`);
    }
  });
`;
    }

    // Add safe modern prefix optimizations
    script += `
  // Safe modern CSS optimizations for 2024+ browsers
  const modernOptimizations = [
    // Remove redundant webkit prefixes where standard is well supported
    { 
      pattern: /-webkit-border-radius:\\s*([^;]+);\\s*border-radius:\\s*\\1/g,
      replacement: 'border-radius: $1',
      reason: 'border-radius standard since IE9'
    },
    { 
      pattern: /-webkit-box-shadow:\\s*([^;]+);\\s*box-shadow:\\s*\\1/g,
      replacement: 'box-shadow: $1',
      reason: 'box-shadow standard since IE9'
    },
    {
      pattern: /-webkit-user-select:\\s*none;\\s*-moz-user-select:\\s*none;\\s*-ms-user-select:\\s*none;\\s*user-select:\\s*none/g,
      replacement: 'user-select: none',
      reason: 'user-select well supported across modern browsers'
    },
    {
      pattern: /-webkit-appearance:\\s*none;\\s*-moz-appearance:\\s*none;\\s*appearance:\\s*none/g,
      replacement: 'appearance: none',
      reason: 'appearance well supported in modern browsers'
    }
  ];

  modernOptimizations.forEach(opt => {
    const beforeLength = css.length;
    css = css.replace(opt.pattern, opt.replacement);
    if (css.length < beforeLength) {
      removedRules.push(\`Optimized: \${opt.reason}\`);
    }
  });
`;

    script += `
  // Clean up extra whitespace and normalize
  css = css
    .replace(/\\s*{\\s*/g, '{')
    .replace(/;\\s*}/g, '}')
    .replace(/;\\s*;/g, ';')
    .replace(/\\n\\s*\\n/g, '\\n')
    .replace(/\\s+/g, ' ');

  const finalSize = css.length;
  const savings = originalSize - finalSize;
  const percentage = ((savings / originalSize) * 100).toFixed(2);

  console.log(\`Advanced CSS Optimization Complete:\`);
  console.log(\`  Original size: \${originalSize.toLocaleString()} bytes\`);
  console.log(\`  Optimized size: \${finalSize.toLocaleString()} bytes\`);
  console.log(\`  Savings: \${savings.toLocaleString()} bytes (\${percentage}%)\`);
  console.log(\`  Rules removed: \${removedRules.length}\`);
  
  removedRules.forEach(rule => console.log(\`    - \${rule}\`));

  fs.writeFileSync(outputFile, css);
  return { originalSize, finalSize, savings, percentage, removedRules };
}

// Run optimization
const inputFile = 'bundle-optimized.css';
const outputFile = 'bundle-advanced-optimized.css';
optimizeCSS(inputFile, outputFile);
`;

    return script;
  }
}

// Run analysis
async function runDeepAnalysis() {
  const analyzer = new DeepCSSAnalyzer();
  const cssFile = path.join(__dirname, 'bundle-optimized.css');
  
  if (!fs.existsSync(cssFile)) {
    console.error('bundle-optimized.css not found');
    return;
  }

  console.log('🔍 Running deep CSS analysis...');
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  const analysis = analyzer.analyzeCSS(cssContent);

  console.log('\\n📊 Analysis Results:');
  console.log(`  Current file size: ${cssContent.length.toLocaleString()} bytes`);
  console.log(`  Webkit prefixes found: ${analysis.webkitPrefixes.length}`);
  console.log(`  CSS variables found: ${analysis.cssVariables.length}`);
  console.log(`  Obsolete prefixes: ${analysis.obsoletePrefixes.length}`);
  console.log(`  Unused CSS variables: ${analysis.unusedTailwindVars.length}`);
  console.log(`  Duplicate rules: ${analysis.duplicates.length}`);
  console.log(`  Estimated additional savings: ${analysis.estimatedSavings.toLocaleString()} bytes`);

  if (analysis.obsoletePrefixes.length > 0) {
    console.log('\\n🚫 Obsolete Webkit prefixes that can be safely removed:');
    analysis.obsoletePrefixes.forEach(prefix => console.log(`    ${prefix}`));
  }

  if (analysis.unusedTailwindVars.length > 0) {
    console.log('\\n📝 Unused CSS variables (first 10):');
    analysis.unusedTailwindVars.slice(0, 10).forEach(varName => console.log(`    ${varName}`));
    if (analysis.unusedTailwindVars.length > 10) {
      console.log(`    ... and ${analysis.unusedTailwindVars.length - 10} more`);
    }
  }

  if (analysis.duplicates.length > 0) {
    console.log('\\n🔄 Duplicate rules found (first 5):');
    analysis.duplicates.slice(0, 5).forEach(dup => {
      console.log(`    ${dup.selector} (appears ${dup.count} times)`);
    });
  }

  // Generate optimization script
  console.log('\\n🛠️  Generating advanced optimization script...');
  const optimizationScript = analyzer.generateOptimizationScript(analysis);
  fs.writeFileSync(path.join(__dirname, 'advanced-css-optimizer.js'), optimizationScript);
  console.log('    ✅ advanced-css-optimizer.js created');

  return analysis;
}

if (require.main === module) {
  runDeepAnalysis();
}

module.exports = { DeepCSSAnalyzer };