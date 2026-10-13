/**
 * Form Validation Module for Portfolia
 */

import { isValidEmail, isValidURL } from './utils.js';

/**
 * Validates a single input element and displays inline error message
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl 
 * @param {Object} rules - { required: boolean, email: boolean, url: boolean, custom: function }
 * @returns {boolean}
 */
export function validateInput(inputEl, rules = {}) {
  if (!inputEl) return true;

  const value = inputEl.value ? inputEl.value.trim() : '';
  let errorMsg = '';

  if (rules.required && !value) {
    errorMsg = 'This field is required.';
  } else if (rules.email && value && !isValidEmail(value)) {
    errorMsg = 'Please enter a valid email address.';
  } else if (rules.url && value && !isValidURL(value)) {
    errorMsg = 'Please enter a valid URL (e.g. https://example.com).';
  } else if (rules.custom && typeof rules.custom === 'function') {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      errorMsg = customResult || 'Invalid input value.';
    }
  }

  // Look for error message container or create one
  let errorContainer = inputEl.parentElement.querySelector('.field-error-msg');
  if (errorMsg) {
    inputEl.classList.add('input-error');
    if (!errorContainer) {
      errorContainer = document.createElement('span');
      errorContainer.className = 'field-error-msg';
      inputEl.parentElement.appendChild(errorContainer);
    }
    errorContainer.textContent = errorMsg;
    return false;
  } else {
    inputEl.classList.remove('input-error');
    if (errorContainer) {
      errorContainer.remove();
    }
    return true;
  }
}

/**
 * Attaches real-time validation listeners to form elements
 * @param {HTMLFormElement|HTMLElement} container 
 */
export function setupFormValidation(container) {
  if (!container) return;

  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      const isReq = input.hasAttribute('required');
      const isEmail = input.type === 'email' || input.dataset.validate === 'email';
      const isUrl = input.type === 'url' || input.dataset.validate === 'url';
      
      validateInput(input, {
        required: isReq,
        email: isEmail,
        url: isUrl
      });
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        const isReq = input.hasAttribute('required');
        const isEmail = input.type === 'email' || input.dataset.validate === 'email';
        const isUrl = input.type === 'url' || input.dataset.validate === 'url';
        
        validateInput(input, {
          required: isReq,
          email: isEmail,
          url: isUrl
        });
      }
    });
  });
}
