/**
 * Image processing utilities
 */

/**
 * Convert RGB to grayscale value
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {number} Grayscale value
 */
export const toGray = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b);

/**
 * Measure character cell dimensions in monospace font
 * @param {HTMLElement} container - Container element with monospace font
 * @returns {{cw: number, ch: number}} Character width and height
 */
export function measureCell(container) {
  const span = document.createElement('span');
  span.textContent = 'MMMMMMMMMM';
  span.style.fontFamily = 'monospace';
  span.style.fontSize = getComputedStyle(container).fontSize;
  span.style.lineHeight = getComputedStyle(container).lineHeight;
  span.style.visibility = 'hidden';
  
  container.appendChild(span);
  const rect = span.getBoundingClientRect();
  span.remove();
  
  const cw = rect.width / 10;
  const ch = parseFloat(getComputedStyle(container).lineHeight) || 8;
  
  return { cw, ch };
}

/**
 * Calculate optimal dimensions to fit image in container
 * @param {HTMLImageElement} img 
 * @param {HTMLElement} container 
 * @returns {{cols: number, rows: number}}
 */
export function fitDims(img, container) {
  const { cw, ch } = measureCell(container);
  const innerW = container.clientWidth;
  const innerH = container.clientHeight;
  
  const maxCols = Math.max(20, Math.floor(innerW / cw) - 1);
  const maxRows = Math.max(20, Math.floor(innerH / ch) - 1);
  
  const imgAspect = img.height / img.width;
  const charAspect = ch / cw;
  
  const desiredRows = Math.max(30, Math.round(maxCols * imgAspect / charAspect));
  
  let rows = Math.min(desiredRows, maxRows);
  let cols = Math.min(maxCols, Math.max(30, Math.round(rows * (1 / imgAspect) * charAspect)));
  
  cols = Math.max(30, Math.min(cols, maxCols - 1));
  rows = Math.max(30, Math.min(rows, maxRows - 1));
  
  return { cols, rows };
}

/**
 * Get allowed number of columns based on container width
 * @param {HTMLElement} container 
 * @returns {number}
 */
export function allowedCols(container) {
  const { cw } = measureCell(container);
  return Math.max(20, Math.floor(container.clientWidth / cw) - 1);
}

/**
 * Scramble image with block shuffle and jitter effects
 * @param {HTMLImageElement} img 
 * @param {number} intensity - Scramble intensity (0-100)
 * @returns {string} Data URL of scrambled image
 */
export function scrambleImageURL(img, intensity = 45) {
  const w = img.width;
  const h = img.height;
  
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return img.src;
  }
  
  ctx.drawImage(img, 0, 0);
  
  const cells = Math.max(8, Math.round(12 + intensity / 100 * 22));
  const cw = Math.floor(w / cells);
  const ch = Math.floor(h / cells);
  
  // Create blocks
  const blocks = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      blocks.push({
        sx: x * cw,
        sy: y * ch,
        sw: (x === cells - 1) ? w - x * cw : cw,
        sh: (y === cells - 1) ? h - y * ch : ch
      });
    }
  }
  
  // Shuffle blocks
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = (Math.random() < 0.4) 
      ? Math.floor(Math.random() * blocks.length) 
      : i;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }
  
  // Draw shuffled blocks to temp canvas
  const temp = document.createElement('canvas');
  temp.width = w;
  temp.height = h;
  const tx = temp.getContext('2d');
  
  if (!tx) {
    console.error('Failed to get temp canvas context');
    return canvas.toDataURL('image/png');
  }
  
  blocks.forEach((b, idx) => {
    const x = (idx % cells) * cw;
    const y = Math.floor(idx / cells) * ch;
    tx.drawImage(canvas, b.sx, b.sy, b.sw, b.sh, x, y, b.sw, b.sh);
  });
  
  // Apply jitter to rows
  for (let y = 0; y < h; y += 2) {
    const row = tx.getImageData(0, y, w, 1);
    const offset = Math.max(-2, Math.min(2, (Math.random() * 2 - 1) * 2));
    tx.putImageData(row, offset, y);
  }
  
  // Add noise
  const imageData = tx.getImageData(0, 0, w, h);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  tx.putImageData(imageData, 0, 0);
  
  return temp.toDataURL('image/png');
}
