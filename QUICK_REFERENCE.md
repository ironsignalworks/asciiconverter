# Quick Reference Guide

## Project Structure

```
asciiconverter/
??? index.html              # Main HTML file (loads ES modules)
??? package.json            # NPM configuration
??? .gitignore             # Git ignore rules
??? .eslintrc.json         # ESLint config
??? README.md              # Project overview
??? CHANGELOG.md           # Version history
??? CONTRIBUTING.md        # How to contribute
??? REFACTORING_SUMMARY.md # Detailed refactoring info
??? TESTING.md             # Test cases
??? COMPLETION_REPORT.md   # Final report
??? scripts/
?   ??? validate.js        # Validation script
??? src/
    ??? main.js            # Main application
    ??? utils/
        ??? dom.js         # DOM utilities
        ??? image.js       # Image processing
        ??? ascii.js       # ASCII conversion
        ??? export.js      # Export functions
```

## Common Tasks

### Run Development Server
```bash
npm run dev
# Opens at http://localhost:3000
```

### Validate Code
```bash
npm run check
# Checks all modules for syntax errors
```

### Lint Code
```bash
npm run lint
# Runs ESLint (requires eslint package)
```

## Module APIs

### src/utils/dom.js
```javascript
import { $, setCSSProperty } from './utils/dom.js';

const element = $('myId');              // Get element by ID
setCSSProperty(element, '--var', 'val'); // Set CSS variable
```

### src/utils/image.js
```javascript
import { 
  toGray, 
  measureCell, 
  fitDims, 
  allowedCols, 
  scrambleImageURL 
} from './utils/image.js';

const gray = toGray(r, g, b);            // RGB to grayscale
const { cw, ch } = measureCell(element); // Measure char dimensions
const { cols, rows } = fitDims(img, el); // Calculate optimal size
const maxCols = allowedCols(element);    // Get max columns
const dataUrl = scrambleImageURL(img);   // Scramble image
```

### src/utils/ascii.js
```javascript
import { 
  convertASCII, 
  hardWrap, 
  applyEffects 
} from './utils/ascii.js';

const ascii = convertASCII(img, cols, rows, mode, invert);
const wrapped = hardWrap(text, cols);
const withFx = applyEffects(text, { scanlines: true, jitter: true });
```

### src/utils/export.js
```javascript
import { exportTXT, exportPNG } from './utils/export.js';

exportTXT(asciiText, 'output.txt');
exportPNG(text, refElement, inkColor, scale, 'output.png');
```

## Error Handling Pattern

All async operations include error handling:

```javascript
try {
  // Operation
} catch (error) {
  console.error('Descriptive error message:', error);
  // User-friendly fallback
}
```

## Adding New Features

1. Determine which module the feature belongs to
2. Add function with JSDoc comments
3. Export if needed by other modules
4. Update main.js if UI-related
5. Test manually
6. Update CHANGELOG.md

## Common Pitfalls

? Don't use `var` - use `const` or `let`
? Don't use `==` - use `===`
? Don't forget null checks for canvas contexts
? Don't forget error handlers for async operations
? Don't forget to document with JSDoc

? Do use ES6+ features
? Do add error handling
? Do document all functions
? Do validate with `npm run check`
? Do test in multiple browsers

## Debugging Tips

1. **Check browser console** for errors
2. **Use DevTools** to inspect elements
3. **Validate modules** with `npm run check`
4. **Check network tab** for module loading issues
5. **Use breakpoints** in DevTools for step debugging

## Performance Tips

- Canvas operations are cached where possible
- Debouncing prevents excessive recomputation
- Effect application is optimized
- No memory leaks from unclosed resources

## Browser Requirements

- ES6 Modules (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)
- Canvas API
- File API
- Clipboard API (optional)
- Dialog element

## Support

- **Issues**: Open on GitHub
- **Questions**: Create a discussion
- **Contributions**: See CONTRIBUTING.md

---
*Quick reference for ASCII Converter developers*
