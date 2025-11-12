/**
 * DOM utility functions
 */

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement | null}
 */
export const $ = (id) => document.getElementById(id);

/**
 * Set CSS custom property on element
 * @param {HTMLElement} element 
 * @param {string} property 
 * @param {string} value 
 */
export function setCSSProperty(element, property, value) {
  if (!element || !property) return;
  element.style.setProperty(property, value);
}
