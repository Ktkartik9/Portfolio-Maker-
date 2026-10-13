/**
 * App Module for Portfolia
 * Application initialization, router detection, 3D Canvas visual effects (Three.js), and global UI events.
 */

import { loadPortfolioData } from './storage.js';
import { initBuilder } from './builder.js';
import { initPreview, setDeviceMode, openFullscreenPreview } from './preview.js';
import { initExportHandlers } from './export.js';
import { initThemeListener } from './theme.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const isBuilderPage = document.getElementById('builder-root') !== null;

  if (isBuilderPage) {
    initBuilderPage();
  } else {
    initLandingPage();
  }
});

/**
 * Landing Page Initializer
 */
function initLandingPage() {
  initThreeJSBackground();
  initLandingModals();
  initTemplateShowcase();
}

/**
 * Three.js Subtle 3D Geometric Background Animation for Landing Page
 */
function initThreeJSBackground() {
  const canvas = document.getElementById('three-hero-canvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js library not loaded. Falling back to CSS visual animation.');
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create glowing 3D Torus Knot & Particle Field
    const geometry = new THREE.TorusKnotGeometry(1.6, 0.45, 120, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Particle Swarm
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 350;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.7
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particleMesh);

    camera.position.z = 4.8;

    // Mouse tilt tracking
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.008;

      particleMesh.rotation.y -= 0.002;

      mesh.rotation.x += (mouseY * 0.5 - mesh.rotation.x) * 0.05;
      mesh.rotation.y += (mouseX * 0.5 - mesh.rotation.y) * 0.05;

      renderer.render(scene, camera);
    }
    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  } catch (err) {
    console.error('Three.js canvas setup error:', err);
  }
}

/**
 * Landing Page Frontend Modals (Login UI Demo)
 */
function initLandingModals() {
  const loginBtns = document.querySelectorAll('.trigger-login-modal');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('close-login-modal');
  const loginForm = document.getElementById('demo-login-form');

  loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('is-open');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('is-open'));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('⚡ Demo Login Successful! Redirecting to Builder...', 'success');
      if (modal) modal.classList.remove('is-open');
      setTimeout(() => {
        window.location.href = 'builder.html';
      }, 1000);
    });
  }
}

/**
 * Template Selection Buttons on Landing Page
 */
function initTemplateShowcase() {
  const tplBtns = document.querySelectorAll('.use-template-btn');
  tplBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedTpl = btn.dataset.template || 'modern';
      const data = loadPortfolioData();
      data.template = selectedTpl;
      localStorage.setItem('portfolia_user_portfolio_v1', JSON.stringify(data));
      window.location.href = 'builder.html';
    });
  });
}

/**
 * Builder Dashboard Initializer
 */
function initBuilderPage() {
  loadPortfolioData();
  initBuilder();
  initPreview();
  initExportHandlers();

  // Device switcher binding
  const deviceBtns = document.querySelectorAll('.device-btn');
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.device;
      if (mode === 'fullscreen') {
        openFullscreenPreview();
      } else {
        setDeviceMode(mode);
      }
    });
  });

  // Global Theme listener
  initThemeListener();
}
