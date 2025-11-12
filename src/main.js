/**
 * Main application logic for ASCII Converter
 */
import { $, setCSSProperty } from './utils/dom.js';
import { fitDims, allowedCols, scrambleImageURL } from './utils/image.js';
import { convertASCII, hardWrap, applyEffects } from './utils/ascii.js';
import { exportTXT, exportPNG } from './utils/export.js';

class ASCIIConverter {
  constructor() {
    this.elements = {
      file: $('file'),
      mode: $('mode'),
      fit: $('fit'),
      invert: $('invert'),
      scan: $('scanlines'),
      jitter: $('jitter'),
      scramble: $('scramble'),
      threeD: $('threeD'),
      ink: $('ink'),
      txt: $('txtBtn'),
      png: $('pngBtn'),
      pngBig: $('pngBigBtn'),
      out: $('out'),
      help: $('help'),
      helpBtn: $('helpBtn'),
      shareBtn: $('shareBtn'),
      resetBtn: $('resetBtn')
    };
    
    this.state = {
      asciiText: '',
      lastDataUrl: null,
      busy: false,
      queued: false,
      debounceTimer: null
    };
    
    this.init();
  }
  
  init() {
    this.loadStateFromURL();
    this.setupEventListeners();
    this.setInkColor(this.elements.ink.value);
  }
  
  /**
   * Load state from URL parameters (for shared links)
   */
  loadStateFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      if (params.has('mode')) {
        const mode = params.get('mode');
        if (this.elements.mode.querySelector(`option[value="${mode}"]`)) {
          this.elements.mode.value = mode;
        }
      }
      
      if (params.has('fit')) {
        this.elements.fit.checked = params.get('fit') === '1';
      }
      
      if (params.has('inv')) {
        this.elements.invert.checked = params.get('inv') === '1';
      }
      
      if (params.has('scan')) {
        this.elements.scan.checked = params.get('scan') === '1';
      }
      
      if (params.has('jit')) {
        this.elements.jitter.checked = params.get('jit') === '1';
      }
      
      if (params.has('scr')) {
        this.elements.scramble.checked = params.get('scr') === '1';
      }
      
      if (params.has('td')) {
        this.elements.threeD.checked = params.get('td') === '1';
      }
      
      if (params.has('ink')) {
        const inkColor = '#' + params.get('ink');
        // Validate hex color format
        if (/^#[0-9A-Fa-f]{6}$/.test(inkColor)) {
          this.elements.ink.value = inkColor;
        }
      }
    } catch (error) {
      console.error('Error loading state from URL:', error);
    }
  }
  
  setInkColor(hex) {
    setCSSProperty(this.elements.out, '--out-ink', hex);
  }
  
  setupEventListeners() {
    // File input
    this.elements.file.addEventListener('change', () => this.handleFileChange());
    
    // Control changes
    ['change', 'input'].forEach(eventType => {
      [
        this.elements.mode,
        this.elements.fit,
        this.elements.invert,
        this.elements.scan,
        this.elements.jitter,
        this.elements.scramble,
        this.elements.threeD,
        this.elements.ink
      ].forEach(element => {
        element.addEventListener(eventType, () => {
          if (element === this.elements.ink) {
            this.setInkColor(this.elements.ink.value);
          }
          this.scheduleConversion();
        });
      });
    });
    
    // Export buttons
    this.elements.txt.addEventListener('click', () => this.handleExportTXT());
    this.elements.png.addEventListener('click', () => this.handleExportPNG(1));
    this.elements.pngBig.addEventListener('click', () => this.handleExportPNG(2.0));
    
    // Reset button
    this.elements.resetBtn.addEventListener('click', () => this.handleReset());
    
    // Share button
    this.elements.shareBtn.addEventListener('click', () => this.handleShare());
    
    // Help dialog
    this.elements.helpBtn.addEventListener('click', () => {
      this.elements.help.showModal();
    });
    
    // Click outside to close dialog
    this.elements.help.addEventListener('click', (e) => {
      const form = this.elements.help.querySelector('form');
      if (!form) return;
      
      const rect = form.getBoundingClientRect();
      const inside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      if (!inside) {
        this.elements.help.close();
      }
    });
    
    // Window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (!this.state.lastDataUrl) return;
      
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.scheduleConversion(40), 120);
    });
  }
  
  handleFileChange() {
    if (!this.elements.file.files || !this.elements.file.files.length) return;
    
    this.elements.out.textContent = '[Loading image…]';
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.state.lastDataUrl = e.target.result;
      this.scheduleConversion(10);
    };
    
    reader.onerror = () => {
      this.elements.out.textContent = '[Error loading image]';
      console.error('FileReader error');
    };
    
    reader.readAsDataURL(this.elements.file.files[0]);
    
    this.elements.txt.disabled = true;
    this.elements.png.disabled = true;
    this.elements.pngBig.disabled = true;
  }
  
  scheduleConversion(wait = 100) {
    if (!this.state.lastDataUrl) return;
    
    if (this.state.busy) {
      this.state.queued = true;
      return;
    }
    
    clearTimeout(this.state.debounceTimer);
    this.state.debounceTimer = setTimeout(() => this.convert(), wait);
  }
  
  convert() {
    if (!this.state.lastDataUrl) return;
    
    const originalImg = new Image();
    originalImg.onload = () => {
      let srcURL = this.state.lastDataUrl;
      
      if (this.elements.scramble.checked) {
        srcURL = scrambleImageURL(originalImg, 45);
      }
      
      const processedImg = new Image();
      processedImg.onload = () => {
        this.processImage(processedImg);
      };
      
      processedImg.onerror = () => {
        this.elements.out.textContent = '[Error processing image]';
        console.error('Image processing error');
      };
      
      processedImg.src = srcURL;
    };
    
    originalImg.onerror = () => {
      this.elements.out.textContent = '[Error loading image]';
      console.error('Image load error');
    };
    
    originalImg.src = this.state.lastDataUrl;
  }
  
  processImage(img) {
    this.state.busy = true;
    
    let cols, rows;
    
    if (this.elements.fit.checked) {
      const dims = fitDims(img, this.elements.out);
      cols = dims.cols;
      rows = dims.rows;
    } else {
      const maxCols = allowedCols(this.elements.out);
      cols = Math.max(40, Math.floor(maxCols * 0.7));
      
      const { cw, ch } = this.measureCell();
      const charAspect = ch / cw;
      const imgAspect = img.height / img.width;
      
      rows = Math.max(30, Math.round(cols * imgAspect / charAspect));
    }
    
    this.renderFitted(img, cols, rows);
  }
  
  measureCell() {
    const span = document.createElement('span');
    span.textContent = 'MMMMMMMMMM';
    span.style.fontFamily = 'monospace';
    span.style.fontSize = getComputedStyle(this.elements.out).fontSize;
    span.style.lineHeight = getComputedStyle(this.elements.out).lineHeight;
    span.style.visibility = 'hidden';
    
    this.elements.out.appendChild(span);
    const rect = span.getBoundingClientRect();
    span.remove();
    
    const cw = rect.width / 10;
    const ch = parseFloat(getComputedStyle(this.elements.out).lineHeight) || 8;
    
    return { cw, ch };
  }
  
  renderFitted(img, cols, rows) {
    let text = convertASCII(
      img,
      cols,
      rows,
      this.elements.mode.value,
      this.elements.invert.checked
    );
    
    let maxCols = allowedCols(this.elements.out);
    text = hardWrap(text, maxCols);
    
    text = applyEffects(text, {
      scanlines: this.elements.scan.checked,
      jitter: this.elements.jitter.checked
    });
    
    this.elements.out.textContent = text;
    
    // Adjust wrapping if horizontal scroll appears
    let guard = 0;
    while (
      this.elements.out.scrollWidth > this.elements.out.clientWidth &&
      maxCols > 40 &&
      guard < 30
    ) {
      maxCols -= 1;
      text = applyEffects(
        hardWrap(text, maxCols),
        {
          scanlines: this.elements.scan.checked,
          jitter: this.elements.jitter.checked
        }
      );
      this.elements.out.textContent = text;
      guard++;
    }
    
    this.state.asciiText = text;
    
    this.elements.txt.disabled = false;
    this.elements.png.disabled = false;
    this.elements.pngBig.disabled = false;
    
    this.elements.out.classList.toggle('anaglyph', this.elements.threeD.checked);
    
    this.state.busy = false;
    
    if (this.state.queued) {
      this.state.queued = false;
      this.scheduleConversion(60);
    }
  }
  
  handleExportTXT() {
    exportTXT(this.state.asciiText);
  }
  
  handleExportPNG(scale) {
    exportPNG(
      this.state.asciiText,
      this.elements.out,
      this.elements.ink.value,
      scale,
      scale === 2.0 ? 'ascii_isw_big.png' : 'ascii_isw.png'
    );
  }
  
  handleReset() {
    this.state.asciiText = '';
    this.state.lastDataUrl = null;
    
    this.elements.out.textContent = '[Awaiting image]';
    this.elements.txt.disabled = true;
    this.elements.png.disabled = true;
    this.elements.pngBig.disabled = true;
    
    this.elements.file.value = '';
    this.elements.mode.value = 'ascii-dense';
    this.elements.ink.value = '#d0d0d0';
    
    this.setInkColor(this.elements.ink.value);
    
    this.elements.fit.checked = true;
    this.elements.invert.checked = false;
    this.elements.scan.checked = false;
    this.elements.jitter.checked = false;
    this.elements.scramble.checked = false;
    this.elements.threeD.checked = false;
    
    this.elements.out.classList.remove('anaglyph');
  }
  
  handleShare() {
    const base = 'https://ironsignalworks.github.io/asciiconverter/';
    const params = new URLSearchParams();
    
    params.set('mode', this.elements.mode.value);
    params.set('fit', this.elements.fit.checked ? '1' : '0');
    params.set('inv', this.elements.invert.checked ? '1' : '0');
    params.set('scan', this.elements.scan.checked ? '1' : '0');
    params.set('jit', this.elements.jitter.checked ? '1' : '0');
    params.set('scr', this.elements.scramble.checked ? '1' : '0');
    params.set('td', this.elements.threeD.checked ? '1' : '0');
    params.set('ink', this.elements.ink.value.replace('#', ''));
    params.set('utm_source', 'ascii-converter');
    params.set('utm_medium', 'share');
    params.set('utm_campaign', 'lab-to-site');
    
    const url = base + '?' + params.toString();
    
    navigator.clipboard.writeText(url)
      .then(() => {
        const btn = this.elements.shareBtn;
        const originalText = btn.textContent;
        btn.textContent = 'COPIED';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1200);
      })
      .catch(err => {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy link to clipboard');
      });
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new ASCIIConverter();
});
