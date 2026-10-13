/**
 * Theme & Customization Module for Portfolia
 * Controls color palettes, Google fonts, dark/light mode, border-radius, section spacing, and card styling.
 */

export const GOOGLE_FONTS = [
  { name: "Inter", family: "'Inter', sans-serif", link: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" },
  { name: "Outfit", family: "'Outfit', sans-serif", link: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" },
  { name: "Poppins", family: "'Poppins', sans-serif", link: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif", link: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" },
  { name: "Playfair Display", family: "'Playfair Display', serif", link: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" },
  { name: "Fira Code", family: "'Fira Code', monospace", link: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap" }
];

export const COLOR_PRESETS = [
  { name: "Indigo Purple", primary: "#6366f1", accent: "#8b5cf6" },
  { name: "Emerald Cyan", primary: "#10b981", accent: "#06b6d4" },
  { name: "Sunset Crimson", primary: "#f43f5e", accent: "#fb923c" },
  { name: "Electric Ocean", primary: "#2563eb", accent: "#38bdf8" },
  { name: "Cyberpunk Pink", primary: "#ec4899", accent: "#a855f7" },
  { name: "Amber Flame", primary: "#f59e0b", accent: "#ef4444" }
];

/**
 * Dynamically loads Google Font stylesheet link if not already loaded
 * @param {string} fontLink 
 */
export function loadGoogleFont(fontLink) {
  if (!fontLink) return;
  const existing = document.querySelector(`link[href="${fontLink}"]`);
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontLink;
    document.head.appendChild(link);
  }
}

/**
 * Applies custom theme variables to the document or target preview container
 * @param {Object} theme 
 * @param {HTMLElement} [targetEl] 
 */
export function applyTheme(theme, targetEl = document.documentElement) {
  if (!theme) return;

  const fontObj = GOOGLE_FONTS.find(f => f.family === theme.fontFamily) || GOOGLE_FONTS[0];
  if (fontObj && fontObj.link) {
    loadGoogleFont(fontObj.link);
  }

  // Determine light/dark/auto mode
  let isDark = theme.mode === 'dark';
  if (theme.mode === 'auto') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const root = targetEl;
  
  // Custom variables
  root.style.setProperty('--theme-primary', theme.primaryColor || '#6366f1');
  root.style.setProperty('--theme-accent', theme.accentColor || '#8b5cf6');
  root.style.setProperty('--theme-font', theme.fontFamily || "'Inter', sans-serif");
  root.style.setProperty('--theme-radius', theme.borderRadius || '12px');
  root.style.setProperty('--theme-spacing', theme.sectionSpacing || '48px');

  // Background and Text colors based on mode or user override
  if (isDark) {
    root.setAttribute('data-mode', 'dark');
    root.style.setProperty('--theme-bg', theme.backgroundColor && theme.backgroundColor !== '#ffffff' ? theme.backgroundColor : '#0f172a');
    root.style.setProperty('--theme-card-bg', 'rgba(30, 41, 59, 0.7)');
    root.style.setProperty('--theme-card-border', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--theme-text', theme.textColor && theme.textColor !== '#111827' ? theme.textColor : '#f8fafc');
    root.style.setProperty('--theme-text-muted', '#94a3b8');
  } else {
    root.setAttribute('data-mode', 'light');
    root.style.setProperty('--theme-bg', theme.backgroundColor && theme.backgroundColor !== '#0f172a' ? theme.backgroundColor : '#f8fafc');
    root.style.setProperty('--theme-card-bg', 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--theme-card-border', 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--theme-text', theme.textColor && theme.textColor !== '#f8fafc' ? theme.textColor : '#0f172a');
    root.style.setProperty('--theme-text-muted', '#64748b');
  }

  // Card style class mapping
  if (targetEl) {
    targetEl.classList.remove('card-style-glass', 'card-style-flat', 'card-style-outlined', 'card-style-elevated');
    targetEl.classList.add(`card-style-${theme.cardStyle || 'glass'}`);
  }
}

/**
 * Initializes light/dark global theme listener
 */
export function initThemeListener(onModeChange) {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (onModeChange) onModeChange(e.matches ? 'dark' : 'light');
    });
  }
}
