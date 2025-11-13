# !(public/icon.svg) ASCII Converter

DOS-style image to ASCII converter with live rendering and tidy exports.

## Features

- Convert images to ASCII art with multiple rendering modes
- Live preview with real-time effects
- Export as TXT or PNG files
- Effects: Invert, Scanlines, Jitter, Scramble, 3D Anaglyph
- Responsive design for desktop and mobile

## ES Module Refactoring (2025)

This project has been refactored to use ES modules for better code organization and maintainability.

### Structure

```
??? index.html           # Main HTML file
??? package.json         # Project configuration
??? src/
?   ??? main.js         # Main application logic
?   ??? utils/
?       ??? dom.js      # DOM utility functions
?       ??? image.js    # Image processing utilities
?       ??? ascii.js    # ASCII conversion logic
?       ??? export.js   # Export utilities
```

### Key Improvements

1. **Modular Architecture**: Code split into logical modules
2. **Error Handling**: Added proper error handling for file loading and image processing
3. **Type Safety**: Added JSDoc comments for better IDE support
4. **Bug Fixes**:
   - Fixed potential canvas context null checks
   - Added bounds checking for array indices
   - Improved color value clamping in scramble effect
   - Added FileReader error handling
   - Fixed clipboard API error handling

### Development

To run locally:

```bash
# Install a simple HTTP server (ES modules require HTTP/HTTPS)
npm install -g serve

# Serve the directory
npx serve .
```

Then open http://localhost:3000 in your browser.

### Browser Compatibility

Requires a modern browser with support for:
- ES6 Modules
- Canvas API
- File API
- Clipboard API (for share feature)
- Dialog element

## License

ISC

## Author

Iron Signal Works
