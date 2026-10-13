/**
 * Preview Module for Portfolia
 * Manages live updates, device view frame resizing, template switching, and fullscreen modal viewing.
 */

import { renderPortfolio } from './templates.js';
import { applyTheme } from './theme.js';
import { getPortfolioData } from './storage.js';

let previewContainer = null;
let currentDeviceMode = 'desktop';

/**
 * Initializes the live preview system
 * @param {HTMLElement} containerEl 
 */
export function initPreview(containerEl) {
  previewContainer = containerEl;
  updateLivePreview();
}

/**
 * Re-renders the live portfolio preview and applies current theme variables
 */
export function updateLivePreview() {
  if (!previewContainer) {
    previewContainer = document.getElementById('portfolio-preview-target');
  }
  if (!previewContainer) return;

  const data = getPortfolioData();
  
  // Render html
  const html = renderPortfolio(data);
  previewContainer.innerHTML = html;

  // Apply visual theme to preview target container
  applyTheme(data.theme, previewContainer);
}

/**
 * Sets device frame preview mode (desktop, tablet, mobile)
 * @param {'desktop'|'tablet'|'mobile'} mode 
 */
export function setDeviceMode(mode) {
  currentDeviceMode = mode;
  const frameWrap = document.getElementById('preview-frame-wrapper');
  if (!frameWrap) return;

  frameWrap.classList.remove('frame-desktop', 'frame-tablet', 'frame-mobile');
  frameWrap.classList.add(`frame-${mode}`);

  // Highlight active toolbar button
  const btns = document.querySelectorAll('.device-btn');
  btns.forEach(btn => {
    if (btn.dataset.device === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Opens fullscreen preview modal
 */
export function openFullscreenPreview() {
  let modal = document.getElementById('fullscreen-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'fullscreen-preview-modal';
    modal.className = 'fullscreen-modal';
    modal.innerHTML = `
      <div class="fullscreen-modal-bar">
        <span class="fullscreen-modal-title"><i class="fa-solid fa-eye"></i> Fullscreen Portfolio Preview</span>
        <button class="fullscreen-modal-close" id="close-fullscreen-btn"><i class="fa-solid fa-xmark"></i> Close</button>
      </div>
      <div class="fullscreen-modal-body" id="fullscreen-target"></div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-fullscreen-btn').addEventListener('click', closeFullscreenPreview);
  }

  const data = getPortfolioData();
  const target = document.getElementById('fullscreen-target');
  if (target) {
    target.innerHTML = renderPortfolio(data);
    applyTheme(data.theme, target);
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes fullscreen preview modal
 */
export function closeFullscreenPreview() {
  const modal = document.getElementById('fullscreen-preview-modal');
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}
