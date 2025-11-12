/**
 * ASCII conversion utilities
 */
import { toGray } from './image.js';

// ASCII character palettes
const PALETTES = {
  'ascii-dense': "@#S%?*+;:,.",
  'ascii-sparse': "@%#*+=-:. ",
  'blocks': "???? ",
  'binary': "01"
};

/**
 * Pick character from palette based on value
 * @param {number} value - Brightness value (0-255)
 * @param {string} palette - Character palette
 * @returns {string}
 */
function pickChar(value, palette) {
  const index = Math.floor(value / 255 * (palette.length - 1));
  return palette[Math.max(0, Math.min(palette.length - 1, index))];
}

/**
 * Calculate gradient magnitude for edge detection
 * @param {Float32Array} gray - Grayscale pixel data
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cols - Image width
 * @param {number} rows - Image height
 * @returns {number} Gradient magnitude
 */
function calcGradient(gray, x, y, cols, rows) {
  const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  let sx = 0;
  let sy = 0;
  let k = 0;
  
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++, k++) {
      const X = Math.min(cols - 1, Math.max(0, x + i));
      const Y = Math.min(rows - 1, Math.max(0, y + j));
      const value = gray[Y * cols + X];
      
      sx += value * gxKernel[k];
      sy += value * gyKernel[k];
    }
  }
  
  return Math.min(255, Math.hypot(sx, sy));
}

/**
 * Convert image to ASCII art
 * @param {HTMLImageElement} img 
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {string} mode - Conversion mode
 * @param {boolean} invert - Invert brightness mapping
 * @returns {string} ASCII text
 */
export function convertASCII(img, cols, rows, mode, invert = false) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    console.error('Failed to get canvas context');
    return '[Error: Canvas not supported]';
  }
  
  ctx.drawImage(img, 0, 0, cols, rows);
  
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const data = imageData.data;
  
  // Convert to grayscale
  const gray = new Float32Array(cols * rows);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = toGray(data[i], data[i + 1], data[i + 2]);
  }
  
  let output = '';
  
  if (mode === 'edges') {
    // Edge detection mode
    const palette = invert ? " .:-=+*#%@" : "@%#*+=-:. ";
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const gradient = calcGradient(gray, x, y, cols, rows);
        const value = invert ? (255 - gradient) : gradient;
        output += pickChar(value, palette);
      }
      output += "\n";
    }
  } else {
    // Standard conversion modes - use proper palette mapping
    const palette = PALETTES[mode] || PALETTES['ascii-dense'];
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = gray[y * cols + x];
        const transformedValue = invert ? value : (255 - value);
        
        if (mode === 'binary') {
          output += (transformedValue > 128) ? '1' : '0';
        } else {
          output += pickChar(transformedValue, palette);
        }
      }
      output += "\n";
    }
  }
  
  return output;
}

/**
 * Hard wrap text to specific column width
 * @param {string} text 
 * @param {number} cols 
 * @returns {string}
 */
export function hardWrap(text, cols) {
  const lines = text.split("\n").flatMap(line => {
    if (line.length <= cols) return [line];
    
    const chunks = [];
    for (let i = 0; i < line.length; i += cols) {
      chunks.push(line.slice(i, i + cols));
    }
    return chunks;
  });
  
  return lines.join("\n");
}

/**
 * Apply visual effects to ASCII text
 * @param {string} text 
 * @param {Object} effects - Effect flags
 * @returns {string}
 */
export function applyEffects(text, effects) {
  let lines = text.split("\n");
  
  // Scanlines effect
  if (effects.scanlines) {
    lines = lines.map((line, i) => {
      if (i % 2 === 1) {
        return line.replace(/[^ \n]/g, ch => ch === ' ' ? ' ' : '.');
      }
      return line;
    });
  }
  
  // Jitter effect
  if (effects.jitter) {
    const maxShift = 2;
    lines = lines.map(line => {
      const shift = Math.floor(Math.random() * (maxShift * 2 + 1)) - maxShift;
      
      if (shift > 0) {
        return ' '.repeat(shift) + line.slice(0, Math.max(0, line.length - shift));
      }
      if (shift < 0) {
        return line.slice(-shift).padEnd(line.length, ' ');
      }
      return line;
    });
  }
  
  return lines.join("\n");
}
