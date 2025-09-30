/**
 * Auto-resize input utility to prevent white boxes and descender overflow
 * Makes inputs wrap text exactly without extending beyond text bounds
 */

/**
 * Auto-resize an input element to fit its content
 * @param {HTMLInputElement} input - The input element to resize
 */
export function autoResizeInput(input) {
  if (!input || input.tagName !== 'INPUT') return;
  
  // Create a temporary span to measure text width
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre';
  span.style.font = window.getComputedStyle(input).font;
  span.textContent = input.value || input.placeholder || '';
  
  document.body.appendChild(span);
  const textWidth = span.offsetWidth;
  document.body.removeChild(span);
  
  // Set input width to text width plus small padding
  const minWidth = 20; // Minimum width for empty inputs
  const padding = 8; // Small padding
  input.style.width = Math.max(textWidth + padding, minWidth) + 'px';
}

/**
 * Setup auto-resize for an input element
 * @param {HTMLInputElement} input - The input element to setup
 */
export function setupAutoResize(input) {
  if (!input || input.tagName !== 'INPUT') return;
  
  // Initial resize
  autoResizeInput(input);
  
  // Add event listeners for dynamic resizing
  const resizeHandler = () => autoResizeInput(input);
  
  input.addEventListener('input', resizeHandler);
  input.addEventListener('change', resizeHandler);
  input.addEventListener('keyup', resizeHandler);
  input.addEventListener('paste', () => {
    // Delay for paste to complete
    setTimeout(resizeHandler, 0);
  });
  
  // Store cleanup function on the input
  input._autoResizeCleanup = () => {
    input.removeEventListener('input', resizeHandler);
    input.removeEventListener('change', resizeHandler);
    input.removeEventListener('keyup', resizeHandler);
  };
}

/**
 * Cleanup auto-resize for an input element
 * @param {HTMLInputElement} input - The input element to cleanup
 */
export function cleanupAutoResize(input) {
  if (input && input._autoResizeCleanup) {
    input._autoResizeCleanup();
    delete input._autoResizeCleanup;
  }
}

/**
 * Setup auto-resize for all PDF variable inputs
 */
export function setupPdfVariableInputs() {
  const selectors = [
    '.pdf-preview-container input',
    '.pdf-viewport input',
    '.document-view input',
    '.canvas-container input',
    '.enhanced-pdf-viewer input',
    '.email-preview input'
  ];
  
  selectors.forEach(selector => {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
      applyCleanTextWrapping(input);
      setupAutoResize(input);
    });
  });
}

/**
 * Continuously monitor and fix PDF inputs (aggressive approach)
 */
export function startInputMonitoring() {
  const monitor = () => {
    const selectors = [
      '.pdf-preview-container input',
      '.pdf-viewport input',
      '.document-view input',
      '.canvas-container input',
      '.enhanced-pdf-viewer input',
      '.email-preview input'
    ];
    
    selectors.forEach(selector => {
      const inputs = document.querySelectorAll(selector);
      inputs.forEach(input => {
        if (!input.classList.contains('auto-resize-input')) {
          console.log('Found unprocessed input, applying clean wrapping:', input);
          applyCleanTextWrapping(input);
          setupAutoResize(input);
        }
      });
    });
  };
  
  // Run immediately
  monitor();
  
  // Run every 500ms to catch new inputs
  const intervalId = setInterval(monitor, 500);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Stop input monitoring
 */
let monitoringCleanup = null;

export function enableInputMonitoring() {
  if (monitoringCleanup) {
    monitoringCleanup();
  }
  monitoringCleanup = startInputMonitoring();
}

export function disableInputMonitoring() {
  if (monitoringCleanup) {
    monitoringCleanup();
    monitoringCleanup = null;
  }
}

/**
 * Cleanup all PDF variable inputs
 */
export function cleanupPdfVariableInputs() {
  const selectors = [
    '.pdf-preview-container input',
    '.pdf-viewport input', 
    '.document-view input',
    '.canvas-container input'
  ];
  
  selectors.forEach(selector => {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
      cleanupAutoResize(input);
      input.classList.remove('auto-resize-input');
    });
  });
}

/**
 * Apply clean text wrapping styles to prevent descender overflow
 * @param {HTMLInputElement} input - The input element
 */
export function applyCleanTextWrapping(input) {
  if (!input) return;
  
  // NUCLEAR APPROACH - Remove all existing styles first
  input.removeAttribute('style');
  input.className = input.className.replace(/\b[\w-]*input[\w-]*\b/g, '').trim();
  
  const styles = {
    all: 'unset',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '0',
    margin: '0',
    verticalAlign: 'baseline',
    lineHeight: '1',
    height: 'auto',
    minHeight: 'auto',
    maxHeight: 'none',
    display: 'inline',
    width: 'auto',
    minWidth: '1ch',
    maxWidth: '300px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    textDecoration: 'inherit',
    boxSizing: 'content-box',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textAlign: 'left'
  };
  
  // Apply styles with !important
  Object.entries(styles).forEach(([property, value]) => {
    input.style.setProperty(property, value, 'important');
  });
  
  // Add our clean class
  input.classList.add('auto-resize-input');
  
  // Add focus/hover handlers
  const originalBackground = input.style.background;
  const originalBorderBottom = input.style.borderBottom;
  
  input.addEventListener('focus', () => {
    input.style.borderBottom = '1px solid rgba(59, 130, 246, 0.5)';
    input.style.background = 'rgba(59, 130, 246, 0.05)';
  });
  
  input.addEventListener('blur', () => {
    input.style.borderBottom = originalBorderBottom;
    input.style.background = originalBackground;
  });
  
  input.addEventListener('mouseenter', () => {
    if (input !== document.activeElement) {
      input.style.background = 'rgba(0, 0, 0, 0.02)';
      input.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    }
  });
  
  input.addEventListener('mouseleave', () => {
    if (input !== document.activeElement) {
      input.style.background = originalBackground;
      input.style.borderBottom = originalBorderBottom;
    }
  });
}
