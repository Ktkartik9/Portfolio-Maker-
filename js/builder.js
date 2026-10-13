/**
 * Builder Dashboard Module for Portfolia
 * Controls sidebar tabs, form bindings, dynamic list item CRUD, HTML5 Drag & Drop section reordering, image uploads, and live preview hooks.
 */

import { getPortfolioData, savePortfolioData, loadDemoData, resetPortfolioData } from './storage.js';
import { updateLivePreview } from './preview.js';
import { generateId, readFileAsDataURL, showToast, debounce } from './utils.js';
import { COLOR_PRESETS, GOOGLE_FONTS } from './theme.js';
import { setupFormValidation } from './validation.js';

let activeSectionTab = 'profile';

/**
 * Main Builder Initializer
 */
export function initBuilder() {
  setupSidebarNavigation();
  renderActiveSectionForm();
  setupAutoSaveHooks();
  setupDemoDataButton();
}

/**
 * Setup sidebar tab switching
 */
function setupSidebarNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.dataset.section;
      if (!targetSection) return;

      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      activeSectionTab = targetSection;
      renderActiveSectionForm();

      // On mobile, close sidebar drawer when item selected
      const sidebar = document.getElementById('builder-sidebar');
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('is-mobile-open');
      }
    });
  });

  // Mobile sidebar toggle button
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.getElementById('builder-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('is-mobile-open');
    });
  }
}

/**
 * Renders form fields for the currently active tab
 */
export function renderActiveSectionForm() {
  const formContainer = document.getElementById('editor-form-container');
  if (!formContainer) return;

  const data = getPortfolioData();

  switch (activeSectionTab) {
    case 'profile':
      formContainer.innerHTML = renderProfileForm(data.profile);
      bindProfileEvents();
      break;
    case 'skills':
      formContainer.innerHTML = renderSkillsForm(data.skills);
      bindSkillsEvents();
      break;
    case 'education':
      formContainer.innerHTML = renderEducationForm(data.education);
      bindEducationEvents();
      break;
    case 'experience':
      formContainer.innerHTML = renderExperienceForm(data.experience);
      bindExperienceEvents();
      break;
    case 'projects':
      formContainer.innerHTML = renderProjectsForm(data.projects);
      bindProjectsEvents();
      break;
    case 'certifications':
      formContainer.innerHTML = renderCertificationsForm(data.certifications);
      bindCertificationsEvents();
      break;
    case 'social':
      formContainer.innerHTML = renderSocialForm(data.social);
      bindSocialEvents();
      break;
    case 'theme':
      formContainer.innerHTML = renderThemeForm(data);
      bindThemeEvents();
      break;
    case 'order':
      formContainer.innerHTML = renderSectionOrderForm(data.sectionOrder);
      bindSectionOrderEvents();
      break;
    default:
      formContainer.innerHTML = renderProfileForm(data.profile);
      bindProfileEvents();
  }

  setupFormValidation(formContainer);
}

/* ==========================================================================
   1. PROFILE FORM
   ========================================================================== */
function renderProfileForm(profile = {}) {
  return `
    <div class="form-section-header">
      <h2 class="form-section-title"><i class="fa-solid fa-user-circle"></i> Profile Information</h2>
      <p class="form-section-desc">Manage your core personal and professional bio details.</p>
    </div>

    <form id="profile-form" class="builder-form" onsubmit="return false;">
      <div class="photo-upload-row">
        <div class="photo-preview-box" id="profile-photo-preview">
          ${profile.photo ? `<img src="${profile.photo}" alt="Profile Preview" />` : `<i class="fa-solid fa-user-astronaut"></i>`}
        </div>
        <div class="photo-upload-actions">
          <label for="profile-photo-input" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-upload"></i> Upload Photo
          </label>
          <input type="file" id="profile-photo-input" accept="image/*" style="display: none;" />
          ${profile.photo ? `<button type="button" class="btn btn-danger-outline btn-sm" id="remove-photo-btn"><i class="fa-solid fa-trash"></i> Remove</button>` : ''}
          <div class="form-field-hint">JPG, PNG or GIF (max 2MB). Auto-saved.</div>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="fullName">Full Name <span class="required">*</span></label>
          <input type="text" id="fullName" value="${profile.fullName || ''}" placeholder="e.g. Kartik Patel" required />
        </div>

        <div class="form-group">
          <label for="title">Professional Title <span class="required">*</span></label>
          <input type="text" id="title" value="${profile.title || ''}" placeholder="e.g. Software Engineer" required />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" value="${profile.email || ''}" placeholder="kt0909@example.com" />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" value="${profile.phone || ''}" placeholder="+91 1234567890" />
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input type="text" id="location" value="${profile.location || ''}" placeholder="Bengaluru, India" />
        </div>

        <div class="form-group">
          <label for="website">Personal Website</label>
          <input type="url" id="website" value="${profile.website || ''}" placeholder="https://kt.live" />
        </div>
      </div>

      <div class="form-group full-width">
        <label for="bio">Short Tagline / Headline Bio</label>
        <input type="text" id="bio" value="${profile.bio || ''}" placeholder="Passionate engineer building high-impact web applications..." />
      </div>

      <div class="form-group full-width">
        <label for="about">Detailed "About Me" Section</label>
        <textarea id="about" rows="5" placeholder="Tell your professional story, background, and passions...">${profile.about || ''}</textarea>
      </div>
    </form>
  `;
}

function bindProfileEvents() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const data = getPortfolioData();
      data.profile[input.id] = input.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  });

  // Photo Upload
  const photoInput = document.getElementById('profile-photo-input');
  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 3 * 1024 * 1024) {
          showToast('Image file size too large! Please choose an image under 3MB.', 'warning');
          return;
        }
        try {
          const base64 = await readFileAsDataURL(file);
          const data = getPortfolioData();
          data.profile.photo = base64;
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        } catch (err) {
          showToast('Error uploading image file.', 'error');
        }
      }
    });
  }

  const removePhotoBtn = document.getElementById('remove-photo-btn');
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.profile.photo = '';
      savePortfolioData(data, true);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }
}

/* ==========================================================================
   2. SKILLS FORM
   ========================================================================== */
function renderSkillsForm(skills = []) {
  return `
    <div class="form-section-header">
      <div class="header-with-action">
        <div>
          <h2 class="form-section-title"><i class="fa-solid fa-code"></i> Skills & Competencies</h2>
          <p class="form-section-desc">Add technologies, frameworks, and tools with proficiency ratings.</p>
        </div>
        <button type="button" class="btn btn-primary" id="add-skill-btn">
          <i class="fa-solid fa-plus"></i> Add Skill
        </button>
      </div>
    </div>

    <div class="filter-search-bar">
      <div class="search-input-wrap">
        <i class="fa-solid fa-search"></i>
        <input type="text" id="skills-search" placeholder="Search skills..." />
      </div>
    </div>

    <div id="skills-list-container" class="items-cards-list">
      ${skills.length === 0 ? `
        <div class="empty-state">
          <i class="fa-solid fa-layer-group empty-icon"></i>
          <h3>No skills added yet</h3>
          <p>Click "Add Skill" above to start building your tech stack showcase.</p>
        </div>
      ` : skills.map(skill => renderSkillCard(skill)).join('')}
    </div>
  `;
}

function renderSkillCard(skill) {
  return `
    <div class="item-card skill-card" data-id="${skill.id}">
      <div class="item-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Skill Name</label>
            <input type="text" class="skill-name-input" value="${skill.name || ''}" placeholder="e.g. JavaScript" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" class="skill-cat-input" value="${skill.category || ''}" placeholder="e.g. Frontend, Backend, Tools" />
          </div>
          <div class="form-group full-width">
            <div class="range-header">
              <label>Proficiency Level</label>
              <span class="range-val">${skill.level || 80}%</span>
            </div>
            <input type="range" class="skill-level-input" min="10" max="100" step="5" value="${skill.level || 80}" />
          </div>
        </div>
      </div>
      <div class="item-card-actions">
        <button type="button" class="btn-icon delete-skill-btn" title="Delete Skill">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function bindSkillsEvents() {
  const addBtn = document.getElementById('add-skill-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.skills.push({
        id: generateId(),
        name: 'New Skill',
        category: 'Frontend',
        level: 80
      });
      savePortfolioData(data);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const container = document.getElementById('skills-list-container');
  if (container) {
    container.querySelectorAll('.skill-card').forEach(card => {
      const id = card.dataset.id;
      const nameInput = card.querySelector('.skill-name-input');
      const catInput = card.querySelector('.skill-cat-input');
      const levelInput = card.querySelector('.skill-level-input');
      const rangeVal = card.querySelector('.range-val');
      const delBtn = card.querySelector('.delete-skill-btn');

      const updateSkill = () => {
        const data = getPortfolioData();
        const target = data.skills.find(s => s.id === id);
        if (target) {
          target.name = nameInput.value;
          target.category = catInput.value;
          target.level = parseInt(levelInput.value, 10);
          savePortfolioData(data);
          updateLivePreview();
        }
      };

      if (nameInput) nameInput.addEventListener('input', updateSkill);
      if (catInput) catInput.addEventListener('input', updateSkill);
      if (levelInput) {
        levelInput.addEventListener('input', () => {
          rangeVal.textContent = `${levelInput.value}%`;
          updateSkill();
        });
      }

      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const data = getPortfolioData();
          data.skills = data.skills.filter(s => s.id !== id);
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        });
      }
    });
  }

  // Filter skills search
  const searchInput = document.getElementById('skills-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const cards = container.querySelectorAll('.skill-card');
      cards.forEach(c => {
        const name = c.querySelector('.skill-name-input').value.toLowerCase();
        const cat = c.querySelector('.skill-cat-input').value.toLowerCase();
        if (name.includes(query) || cat.includes(query)) {
          c.style.display = '';
        } else {
          c.style.display = 'none';
        }
      });
    });
  }
}

/* ==========================================================================
   3. EDUCATION FORM
   ========================================================================== */
function renderEducationForm(education = []) {
  return `
    <div class="form-section-header">
      <div class="header-with-action">
        <div>
          <h2 class="form-section-title"><i class="fa-solid fa-graduation-cap"></i> Education</h2>
          <p class="form-section-desc">Degrees, institutions, bootcamps, and academic honors.</p>
        </div>
        <button type="button" class="btn btn-primary" id="add-education-btn">
          <i class="fa-solid fa-plus"></i> Add Education
        </button>
      </div>
    </div>

    <div id="education-list-container" class="items-cards-list">
      ${education.length === 0 ? `
        <div class="empty-state">
          <i class="fa-solid fa-school empty-icon"></i>
          <h3>No education entries</h3>
          <p>Add your academic degree or certifications background.</p>
        </div>
      ` : education.map(edu => renderEducationCard(edu)).join('')}
    </div>
  `;
}

function renderEducationCard(edu) {
  return `
    <div class="item-card edu-card" data-id="${edu.id}">
      <div class="item-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Degree / Certificate <span class="required">*</span></label>
            <input type="text" class="edu-degree" value="${edu.degree || ''}" placeholder="e.g. Master of Computer Applications (MCA)" required />
          </div>
          <div class="form-group">
            <label>Institution / University <span class="required">*</span></label>
            <input type="text" class="edu-institution" value="${edu.institution || ''}" placeholder="e.g. IPS Academy" required />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" class="edu-location" value="${edu.location || ''}" placeholder="e.g. Indore, India" />
          </div>
          <div class="form-group">
            <label>Start Year</label>
            <input type="text" class="edu-start" value="${edu.startYear || ''}" placeholder="2016" />
          </div>
          <div class="form-group">
            <label>End Year</label>
            <input type="text" class="edu-end" value="${edu.endYear || ''}" placeholder="2020" />
          </div>
        </div>
        <div class="form-group full-width" style="margin-top: 12px;">
          <label>Description / Highlights</label>
          <textarea class="edu-desc" rows="3" placeholder="Major, GPA, societies, thesis, honors...">${edu.description || ''}</textarea>
        </div>
      </div>
      <div class="item-card-actions">
        <button type="button" class="btn-icon delete-edu-btn" title="Delete Entry">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function bindEducationEvents() {
  const addBtn = document.getElementById('add-education-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.education.push({
        id: generateId(),
        degree: '',
        institution: '',
        location: '',
        startYear: '',
        endYear: '',
        description: ''
      });
      savePortfolioData(data);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const container = document.getElementById('education-list-container');
  if (container) {
    container.querySelectorAll('.edu-card').forEach(card => {
      const id = card.dataset.id;
      const inputs = card.querySelectorAll('input, textarea');

      const updateEdu = () => {
        const data = getPortfolioData();
        const target = data.education.find(e => e.id === id);
        if (target) {
          target.degree = card.querySelector('.edu-degree').value;
          target.institution = card.querySelector('.edu-institution').value;
          target.location = card.querySelector('.edu-location').value;
          target.startYear = card.querySelector('.edu-start').value;
          target.endYear = card.querySelector('.edu-end').value;
          target.description = card.querySelector('.edu-desc').value;
          savePortfolioData(data);
          updateLivePreview();
        }
      };

      inputs.forEach(i => i.addEventListener('input', updateEdu));

      const delBtn = card.querySelector('.delete-edu-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const data = getPortfolioData();
          data.education = data.education.filter(e => e.id !== id);
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        });
      }
    });
  }
}

/* ==========================================================================
   4. EXPERIENCE FORM
   ========================================================================== */
function renderExperienceForm(experience = []) {
  return `
    <div class="form-section-header">
      <div class="header-with-action">
        <div>
          <h2 class="form-section-title"><i class="fa-solid fa-briefcase"></i> Work Experience</h2>
          <p class="form-section-desc">Employment history, job roles, and key responsibilities.</p>
        </div>
        <button type="button" class="btn btn-primary" id="add-experience-btn">
          <i class="fa-solid fa-plus"></i> Add Job
        </button>
      </div>
    </div>

    <div id="experience-list-container" class="items-cards-list">
      ${experience.length === 0 ? `
        <div class="empty-state">
          <i class="fa-solid fa-user-tie empty-icon"></i>
          <h3>No experience entries</h3>
          <p>Add work positions to create your professional timeline.</p>
        </div>
      ` : experience.map(exp => renderExperienceCard(exp)).join('')}
    </div>
  `;
}

function renderExperienceCard(exp) {
  return `
    <div class="item-card exp-card" data-id="${exp.id}">
      <div class="item-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Job Title <span class="required">*</span></label>
            <input type="text" class="exp-title" value="${exp.title || ''}" placeholder="e.g. Software Developer" required />
          </div>
          <div class="form-group">
            <label>Company Name <span class="required">*</span></label>
            <input type="text" class="exp-company" value="${exp.company || ''}" placeholder="e.g. Freelance / Personal Projects" required />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" class="exp-location" value="${exp.location || ''}" placeholder="Remote" />
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input type="month" class="exp-start" value="${exp.startDate || ''}" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="month" class="exp-end" value="${exp.endDate || ''}" ${exp.current ? 'disabled' : ''} />
          </div>
          <div class="form-group full-width">
            <label class="checkbox-label">
              <input type="checkbox" class="exp-current" ${exp.current ? 'checked' : ''} />
              <span>I currently work in this role</span>
            </label>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top: 12px;">
          <label>Job Description & Achievements</label>
          <textarea class="exp-desc" rows="4" placeholder="Describe key accomplishments, team leadership, tech stack used...">${exp.description || ''}</textarea>
        </div>
      </div>
      <div class="item-card-actions">
        <button type="button" class="btn-icon delete-exp-btn" title="Delete Role">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function bindExperienceEvents() {
  const addBtn = document.getElementById('add-experience-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.experience.push({
        id: generateId(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      savePortfolioData(data);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const container = document.getElementById('experience-list-container');
  if (container) {
    container.querySelectorAll('.exp-card').forEach(card => {
      const id = card.dataset.id;
      const inputs = card.querySelectorAll('input, textarea');
      const currentChk = card.querySelector('.exp-current');
      const endDateInput = card.querySelector('.exp-end');

      const updateExp = () => {
        const data = getPortfolioData();
        const target = data.experience.find(x => x.id === id);
        if (target) {
          target.title = card.querySelector('.exp-title').value;
          target.company = card.querySelector('.exp-company').value;
          target.location = card.querySelector('.exp-location').value;
          target.startDate = card.querySelector('.exp-start').value;
          target.endDate = endDateInput.value;
          target.current = currentChk.checked;
          target.description = card.querySelector('.exp-desc').value;
          savePortfolioData(data);
          updateLivePreview();
        }
      };

      inputs.forEach(i => i.addEventListener('input', updateExp));

      if (currentChk) {
        currentChk.addEventListener('change', () => {
          endDateInput.disabled = currentChk.checked;
          if (currentChk.checked) endDateInput.value = '';
          updateExp();
        });
      }

      const delBtn = card.querySelector('.delete-exp-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const data = getPortfolioData();
          data.experience = data.experience.filter(x => x.id !== id);
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        });
      }
    });
  }
}

/* ==========================================================================
   5. PROJECTS FORM
   ========================================================================== */
function renderProjectsForm(projects = []) {
  return `
    <div class="form-section-header">
      <div class="header-with-action">
        <div>
          <h2 class="form-section-title"><i class="fa-solid fa-rocket"></i> Projects Management</h2>
          <p class="form-section-desc">Showcase your portfolio applications, code repositories, and live demos.</p>
        </div>
        <button type="button" class="btn btn-primary" id="add-project-btn">
          <i class="fa-solid fa-plus"></i> Add Project
        </button>
      </div>
    </div>

    <div id="projects-list-container" class="items-cards-list">
      ${projects.length === 0 ? `
        <div class="empty-state">
          <i class="fa-solid fa-laptop-code empty-icon"></i>
          <h3>No projects added yet</h3>
          <p>Click "Add Project" to showcase your best software applications.</p>
        </div>
      ` : projects.map(proj => renderProjectCard(proj)).join('')}
    </div>
  `;
}

function renderProjectCard(proj) {
  const techString = proj.technologies ? proj.technologies.join(', ') : '';
  return `
    <div class="item-card proj-card" data-id="${proj.id}">
      <div class="item-card-body">
        <div class="proj-image-row">
          <div class="proj-img-preview" id="proj-img-preview-${proj.id}">
            ${proj.image ? `<img src="${proj.image}" alt="${proj.name}" />` : `<i class="fa-solid fa-image"></i>`}
          </div>
          <div class="proj-img-actions">
            <label for="proj-img-input-${proj.id}" class="btn btn-outline btn-xs">
              <i class="fa-solid fa-upload"></i> Project Image
            </label>
            <input type="file" id="proj-img-input-${proj.id}" class="proj-img-file-input" accept="image/*" style="display:none;" />
            <input type="url" class="proj-img-url-input" value="${proj.image || ''}" placeholder="Or paste image URL..." />
          </div>
        </div>

        <div class="form-grid" style="margin-top: 14px;">
          <div class="form-group">
            <label>Project Name <span class="required">*</span></label>
            <input type="text" class="proj-name" value="${proj.name || ''}" placeholder="e.g. Freelancer Marketplace" required />
          </div>
          <div class="form-group">
            <label>Technologies Used (comma separated)</label>
            <input type="text" class="proj-techs" value="${techString}" placeholder="Python, Django, HTML, CSS, JavaScript" />
          </div>
          <div class="form-group">
            <label>GitHub Repository URL</label>
            <input type="url" class="proj-github" value="${proj.githubUrl || ''}" placeholder="https://github.com/KartikPatel" />
          </div>
          <div class="form-group">
            <label>Live Demo URL</label>
            <input type="url" class="proj-demo" value="${proj.demoUrl || ''}" placeholder="https://demo.example.com" />
          </div>
          <div class="form-group full-width">
            <label class="checkbox-label">
              <input type="checkbox" class="proj-featured" ${proj.featured ? 'checked' : ''} />
              <span>Mark as Featured Project</span>
            </label>
          </div>
        </div>

        <div class="form-group full-width" style="margin-top: 12px;">
          <label>Project Description</label>
          <textarea class="proj-desc" rows="3" placeholder="Explain the problem solved, architectural choices, features...">${proj.description || ''}</textarea>
        </div>
      </div>
      <div class="item-card-actions">
        <button type="button" class="btn-icon delete-proj-btn" title="Delete Project">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function bindProjectsEvents() {
  const addBtn = document.getElementById('add-project-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.projects.push({
        id: generateId(),
        name: 'New Project',
        description: '',
        technologies: ['JavaScript', 'HTML5', 'CSS3'],
        githubUrl: '',
        demoUrl: '',
        image: '',
        featured: false
      });
      savePortfolioData(data);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const container = document.getElementById('projects-list-container');
  if (container) {
    container.querySelectorAll('.proj-card').forEach(card => {
      const id = card.dataset.id;
      const inputs = card.querySelectorAll('input[type="text"], input[type="url"], textarea');
      const featuredChk = card.querySelector('.proj-featured');
      const fileInput = card.querySelector(`.proj-img-file-input`);
      const imgUrlInput = card.querySelector('.proj-img-url-input');

      const updateProj = () => {
        const data = getPortfolioData();
        const target = data.projects.find(p => p.id === id);
        if (target) {
          target.name = card.querySelector('.proj-name').value;
          target.description = card.querySelector('.proj-desc').value;
          const techVal = card.querySelector('.proj-techs').value;
          target.technologies = techVal ? techVal.split(',').map(t => t.trim()).filter(Boolean) : [];
          target.githubUrl = card.querySelector('.proj-github').value;
          target.demoUrl = card.querySelector('.proj-demo').value;
          target.image = imgUrlInput.value;
          target.featured = featuredChk.checked;
          savePortfolioData(data);
          updateLivePreview();
        }
      };

      inputs.forEach(i => i.addEventListener('input', updateProj));
      if (featuredChk) featuredChk.addEventListener('change', updateProj);

      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 3 * 1024 * 1024) {
              showToast('Image file too large! Limit: 3MB', 'warning');
              return;
            }
            try {
              const base64 = await readFileAsDataURL(file);
              imgUrlInput.value = base64;
              updateProj();
              renderActiveSectionForm();
            } catch (_) { }
          }
        });
      }

      const delBtn = card.querySelector('.delete-proj-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const data = getPortfolioData();
          data.projects = data.projects.filter(p => p.id !== id);
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        });
      }
    });
  }
}

/* ==========================================================================
   6. CERTIFICATIONS FORM
   ========================================================================== */
function renderCertificationsForm(certifications = []) {
  return `
    <div class="form-section-header">
      <div class="header-with-action">
        <div>
          <h2 class="form-section-title"><i class="fa-solid fa-certificate"></i> Certifications</h2>
          <p class="form-section-desc">Add professional credentials, certifications, and verified badges.</p>
        </div>
        <button type="button" class="btn btn-primary" id="add-cert-btn">
          <i class="fa-solid fa-plus"></i> Add Certification
        </button>
      </div>
    </div>

    <div id="certifications-list-container" class="items-cards-list">
      ${certifications.length === 0 ? `
        <div class="empty-state">
          <i class="fa-solid fa-award empty-icon"></i>
          <h3>No certifications added</h3>
          <p>Add industry certifications to highlight specialized knowledge.</p>
        </div>
      ` : certifications.map(cert => renderCertCard(cert)).join('')}
    </div>
  `;
}

function renderCertCard(cert) {
  return `
    <div class="item-card cert-card" data-id="${cert.id}">
      <div class="item-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Certification Name <span class="required">*</span></label>
            <input type="text" class="cert-name" value="${cert.name || ''}" placeholder="e.g. Enter your certification" required />
          </div>
          <div class="form-group">
            <label>Issuing Organization <span class="required">*</span></label>
            <input type="text" class="cert-org" value="${cert.organization || ''}" placeholder="e.g. Organization name" required />
          </div>
          <div class="form-group">
            <label>Issue Date</label>
            <input type="month" class="cert-date" value="${cert.issueDate || ''}" />
          </div>
          <div class="form-group">
            <label>Credential ID</label>
            <input type="text" class="cert-id" value="${cert.credentialId || ''}" placeholder="Credential ID" />
          </div>
          <div class="form-group full-width">
            <label>Verification URL</label>
            <input type="url" class="cert-url" value="${cert.credentialUrl || ''}" placeholder="https://..." />
          </div>
        </div>
      </div>
      <div class="item-card-actions">
        <button type="button" class="btn-icon delete-cert-btn" title="Delete Certification">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function bindCertificationsEvents() {
  const addBtn = document.getElementById('add-cert-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const data = getPortfolioData();
      data.certifications.push({
        id: generateId(),
        name: '',
        organization: '',
        issueDate: '',
        credentialId: '',
        credentialUrl: ''
      });
      savePortfolioData(data);
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const container = document.getElementById('certifications-list-container');
  if (container) {
    container.querySelectorAll('.cert-card').forEach(card => {
      const id = card.dataset.id;
      const inputs = card.querySelectorAll('input');

      const updateCert = () => {
        const data = getPortfolioData();
        const target = data.certifications.find(c => c.id === id);
        if (target) {
          target.name = card.querySelector('.cert-name').value;
          target.organization = card.querySelector('.cert-org').value;
          target.issueDate = card.querySelector('.cert-date').value;
          target.credentialId = card.querySelector('.cert-id').value;
          target.credentialUrl = card.querySelector('.cert-url').value;
          savePortfolioData(data);
          updateLivePreview();
        }
      };

      inputs.forEach(i => i.addEventListener('input', updateCert));

      const delBtn = card.querySelector('.delete-cert-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          const data = getPortfolioData();
          data.certifications = data.certifications.filter(c => c.id !== id);
          savePortfolioData(data, true);
          renderActiveSectionForm();
          updateLivePreview();
        });
      }
    });
  }
}

/* ==========================================================================
   7. SOCIAL LINKS FORM
   ========================================================================== */
function renderSocialForm(social = {}) {
  return `
    <div class="form-section-header">
      <h2 class="form-section-title"><i class="fa-solid fa-share-nodes"></i> Social & Web Links</h2>
      <p class="form-section-desc">Connect your social profiles and personal presence. Icons only render if links are provided.</p>
    </div>

    <form id="social-form" class="builder-form" onsubmit="return false;">
      <div class="form-grid">
        <div class="form-group">
          <label><i class="fa-brands fa-github"></i> GitHub URL</label>
          <input type="url" id="social-github" value="${social.github || ''}" placeholder="https://github.com/KartikPatel" />
        </div>
        <div class="form-group">
          <label><i class="fa-brands fa-linkedin"></i> LinkedIn URL</label>
          <input type="url" id="social-linkedin" value="${social.linkedin || ''}" placeholder="https://www.linkedin.com/in/kartikpatel" />
        </div>
        <div class="form-group">
          <label><i class="fa-brands fa-x-twitter"></i> Twitter / X URL</label>
          <input type="url" id="social-twitter" value="${social.twitter || ''}" placeholder="https://x.com/username" />
        </div>
        <div class="form-group">
          <label><i class="fa-brands fa-instagram"></i> Instagram URL</label>
          <input type="url" id="social-instagram" value="${social.instagram || ''}" placeholder="https://instagram.com/username" />
        </div>
        <div class="form-group">
          <label><i class="fa-brands fa-youtube"></i> YouTube URL</label>
          <input type="url" id="social-youtube" value="${social.youtube || ''}" placeholder="https://youtube.com/@username" />
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-globe"></i> Personal Website</label>
          <input type="url" id="social-website" value="${social.website || ''}" placeholder="https://kt.live" />
        </div>
      </div>
    </form>
  `;
}

function bindSocialEvents() {
  const form = document.getElementById('social-form');
  if (!form) return;

  const keyMap = {
    'social-github': 'github',
    'social-linkedin': 'linkedin',
    'social-twitter': 'twitter',
    'social-instagram': 'instagram',
    'social-youtube': 'youtube',
    'social-website': 'website'
  };

  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const data = getPortfolioData();
      const key = keyMap[input.id];
      if (key) {
        data.social[key] = input.value;
        savePortfolioData(data);
        updateLivePreview();
      }
    });
  });
}

/* ==========================================================================
   8. THEME & APPEARANCE FORM
   ========================================================================== */
function renderThemeForm(data) {
  const theme = data.theme || {};
  const template = data.template || 'modern';

  return `
    <div class="form-section-header">
      <h2 class="form-section-title"><i class="fa-solid fa-palette"></i> Theme & Customization</h2>
      <p class="form-section-desc">Personalize color palettes, typography, card layout styles, and templates.</p>
    </div>

    <div class="theme-customizer-grid">
      <!-- Template Selector -->
      <div class="theme-card-block full-width">
        <label class="theme-block-label"><i class="fa-solid fa-layer-group"></i> Portfolio Template</label>
        <div class="templates-radio-grid">
          <label class="template-choice ${template === 'minimal' ? 'selected' : ''}">
            <input type="radio" name="template-select" value="minimal" ${template === 'minimal' ? 'checked' : ''} />
            <div class="tpl-preview-box tpl-box-minimal">
              <div class="tpl-box-line title"></div>
              <div class="tpl-box-line"></div>
            </div>
            <div class="tpl-choice-name">Minimal</div>
            <div class="tpl-choice-desc">Clean corporate typography layout</div>
          </label>

          <label class="template-choice ${template === 'modern' ? 'selected' : ''}">
            <input type="radio" name="template-select" value="modern" ${template === 'modern' ? 'checked' : ''} />
            <div class="tpl-preview-box tpl-box-modern">
              <div class="tpl-box-chip"></div>
              <div class="tpl-box-card"></div>
            </div>
            <div class="tpl-choice-name">Modern</div>
            <div class="tpl-choice-desc">Glassmorphism cards & glowing gradients</div>
          </label>

          <label class="template-choice ${template === 'creative' ? 'selected' : ''}">
            <input type="radio" name="template-select" value="creative" ${template === 'creative' ? 'checked' : ''} />
            <div class="tpl-preview-box tpl-box-creative">
              <div class="tpl-box-circle"></div>
              <div class="tpl-box-card accent"></div>
            </div>
            <div class="tpl-choice-name">Creative</div>
            <div class="tpl-choice-desc">High-impact visual canvas design</div>
          </label>
        </div>
      </div>

      <!-- Color Palettes -->
      <div class="theme-card-block">
        <label class="theme-block-label"><i class="fa-solid fa-swatchbook"></i> Color Scheme</label>
        <div class="color-presets-list">
          ${COLOR_PRESETS.map(p => `
            <button type="button" class="preset-btn" data-primary="${p.primary}" data-accent="${p.accent}" title="${p.name}">
              <span class="preset-swatch" style="background: linear-gradient(135deg, ${p.primary}, ${p.accent})"></span>
              <span class="preset-name">${p.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="form-grid custom-colors-row" style="margin-top: 14px;">
          <div class="form-group">
            <label>Primary Color</label>
            <div class="color-picker-input-wrap">
              <input type="color" id="primaryColorPicker" value="${theme.primaryColor || '#6366f1'}" />
              <input type="text" id="primaryColorText" value="${theme.primaryColor || '#6366f1'}" />
            </div>
          </div>
          <div class="form-group">
            <label>Accent Color</label>
            <div class="color-picker-input-wrap">
              <input type="color" id="accentColorPicker" value="${theme.accentColor || '#8b5cf6'}" />
              <input type="text" id="accentColorText" value="${theme.accentColor || '#8b5cf6'}" />
            </div>
          </div>
        </div>
      </div>

      <!-- Typography -->
      <div class="theme-card-block">
        <label class="theme-block-label"><i class="fa-solid fa-font"></i> Google Font</label>
        <select id="fontFamilySelect" class="form-select">
          ${GOOGLE_FONTS.map(f => `
            <option value="${f.family}" ${theme.fontFamily === f.family ? 'selected' : ''}>${f.name}</option>
          `).join('')}
        </select>

        <label class="theme-block-label" style="margin-top: 20px;"><i class="fa-solid fa-moon"></i> Appearance Mode</label>
        <div class="segmented-control">
          <button type="button" class="segment-btn ${theme.mode === 'dark' ? 'active' : ''}" data-mode="dark"><i class="fa-solid fa-moon"></i> Dark</button>
          <button type="button" class="segment-btn ${theme.mode === 'light' ? 'active' : ''}" data-mode="light"><i class="fa-solid fa-sun"></i> Light</button>
          <button type="button" class="segment-btn ${theme.mode === 'auto' ? 'active' : ''}" data-mode="auto"><i class="fa-solid fa-desktop"></i> Auto</button>
        </div>
      </div>

      <!-- Layout Controls -->
      <div class="theme-card-block full-width">
        <label class="theme-block-label"><i class="fa-solid fa-sliders"></i> Layout & Cards</label>
        <div class="form-grid">
          <div class="form-group">
            <div class="range-header">
              <label>Border Radius</label>
              <span id="radius-val">${theme.borderRadius || '12px'}</span>
            </div>
            <input type="range" id="borderRadiusRange" min="0" max="24" step="2" value="${parseInt(theme.borderRadius || '12', 10)}" />
          </div>

          <div class="form-group">
            <div class="range-header">
              <label>Section Spacing</label>
              <span id="spacing-val">${theme.sectionSpacing || '48px'}</span>
            </div>
            <input type="range" id="sectionSpacingRange" min="24" max="80" step="4" value="${parseInt(theme.sectionSpacing || '48', 10)}" />
          </div>

          <div class="form-group">
            <label>Card Style</label>
            <select id="cardStyleSelect" class="form-select">
              <option value="glass" ${theme.cardStyle === 'glass' ? 'selected' : ''}>Glassmorphism</option>
              <option value="flat" ${theme.cardStyle === 'flat' ? 'selected' : ''}>Flat Solid</option>
              <option value="outlined" ${theme.cardStyle === 'outlined' ? 'selected' : ''}>Outlined</option>
              <option value="elevated" ${theme.cardStyle === 'elevated' ? 'selected' : ''}>Elevated Shadow</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindThemeEvents() {
  const data = getPortfolioData();

  // Template select
  const tplRadios = document.querySelectorAll('input[name="template-select"]');
  tplRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.template-choice').forEach(tc => tc.classList.remove('selected'));
      radio.closest('.template-choice').classList.add('selected');
      data.template = radio.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  });

  // Presets
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const primary = btn.dataset.primary;
      const accent = btn.dataset.accent;
      data.theme.primaryColor = primary;
      data.theme.accentColor = accent;

      document.getElementById('primaryColorPicker').value = primary;
      document.getElementById('primaryColorText').value = primary;
      document.getElementById('accentColorPicker').value = accent;
      document.getElementById('accentColorText').value = accent;

      savePortfolioData(data);
      updateLivePreview();
    });
  });

  // Custom Colors
  const pPicker = document.getElementById('primaryColorPicker');
  const pText = document.getElementById('primaryColorText');
  const aPicker = document.getElementById('accentColorPicker');
  const aText = document.getElementById('accentColorText');

  if (pPicker && pText) {
    pPicker.addEventListener('input', (e) => {
      pText.value = e.target.value;
      data.theme.primaryColor = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
    pText.addEventListener('input', (e) => {
      pPicker.value = e.target.value;
      data.theme.primaryColor = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  }

  if (aPicker && aText) {
    aPicker.addEventListener('input', (e) => {
      aText.value = e.target.value;
      data.theme.accentColor = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
    aText.addEventListener('input', (e) => {
      aPicker.value = e.target.value;
      data.theme.accentColor = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  }

  // Font
  const fontSelect = document.getElementById('fontFamilySelect');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      data.theme.fontFamily = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  }

  // Mode
  const modeBtns = document.querySelectorAll('.segment-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      data.theme.mode = btn.dataset.mode;
      savePortfolioData(data);
      updateLivePreview();
    });
  });

  // Radius & Spacing
  const radiusRange = document.getElementById('borderRadiusRange');
  const spacingRange = document.getElementById('sectionSpacingRange');
  const cardStyleSelect = document.getElementById('cardStyleSelect');

  if (radiusRange) {
    radiusRange.addEventListener('input', (e) => {
      const val = `${e.target.value}px`;
      document.getElementById('radius-val').textContent = val;
      data.theme.borderRadius = val;
      savePortfolioData(data);
      updateLivePreview();
    });
  }

  if (spacingRange) {
    spacingRange.addEventListener('input', (e) => {
      const val = `${e.target.value}px`;
      document.getElementById('spacing-val').textContent = val;
      data.theme.sectionSpacing = val;
      savePortfolioData(data);
      updateLivePreview();
    });
  }

  if (cardStyleSelect) {
    cardStyleSelect.addEventListener('change', (e) => {
      data.theme.cardStyle = e.target.value;
      savePortfolioData(data);
      updateLivePreview();
    });
  }
}

/* ==========================================================================
   9. SECTION ORDER (DRAG & DROP) FORM
   ========================================================================== */
function renderSectionOrderForm(order = []) {
  const labelMap = {
    profile: { title: 'About / Bio', icon: 'fa-user' },
    skills: { title: 'Skills & Toolkit', icon: 'fa-code' },
    experience: { title: 'Work Experience', icon: 'fa-briefcase' },
    projects: { title: 'Projects Showcase', icon: 'fa-rocket' },
    education: { title: 'Education Timeline', icon: 'fa-graduation-cap' },
    certifications: { title: 'Certifications', icon: 'fa-award' }
  };

  const sectionsList = order.map((key, index) => {
    const item = labelMap[key] || { title: key, icon: 'fa-layer-group' };
    return `
      <div class="order-item" draggable="true" data-key="${key}" data-index="${index}">
        <div class="order-drag-handle" title="Drag to reorder">
          <i class="fa-solid fa-grip-vertical"></i>
        </div>
        <div class="order-item-label">
          <i class="fa-solid ${item.icon}"></i> ${item.title}
        </div>
        <div class="order-item-controls">
          <button type="button" class="btn-icon move-up-btn" title="Move Up" ${index === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-up"></i>
          </button>
          <button type="button" class="btn-icon move-down-btn" title="Move Down" ${index === order.length - 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-down"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="form-section-header">
      <h2 class="form-section-title"><i class="fa-solid fa-up-down-left-right"></i> Section Order</h2>
      <p class="form-section-desc">Drag and drop sections or use the arrows to reorder how content appears in your portfolio.</p>
    </div>

    <div id="section-order-list" class="section-order-container">
      ${sectionsList}
    </div>
  `;
}

function bindSectionOrderEvents() {
  const container = document.getElementById('section-order-list');
  if (!container) return;

  const items = container.querySelectorAll('.order-item');
  let draggedItem = null;

  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
      items.forEach(i => i.classList.remove('drag-over'));
      saveNewOrderFromDOM();
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== item) {
        item.classList.add('drag-over');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      if (draggedItem && draggedItem !== item) {
        const allItems = Array.from(container.querySelectorAll('.order-item'));
        const draggedIdx = allItems.indexOf(draggedItem);
        const targetIdx = allItems.indexOf(item);

        if (draggedIdx < targetIdx) {
          container.insertBefore(draggedItem, item.nextSibling);
        } else {
          container.insertBefore(draggedItem, item);
        }
        saveNewOrderFromDOM();
        renderActiveSectionForm();
      }
    });

    // Arrow controls
    const upBtn = item.querySelector('.move-up-btn');
    const downBtn = item.querySelector('.move-down-btn');

    if (upBtn) {
      upBtn.addEventListener('click', () => {
        if (item.previousElementSibling) {
          container.insertBefore(item, item.previousElementSibling);
          saveNewOrderFromDOM();
          renderActiveSectionForm();
        }
      });
    }

    if (downBtn) {
      downBtn.addEventListener('click', () => {
        if (item.nextElementSibling) {
          container.insertBefore(item.nextElementSibling, item);
          saveNewOrderFromDOM();
          renderActiveSectionForm();
        }
      });
    }
  });
}

function saveNewOrderFromDOM() {
  const container = document.getElementById('section-order-list');
  if (!container) return;

  const newOrder = Array.from(container.querySelectorAll('.order-item')).map(el => el.dataset.key);
  const data = getPortfolioData();
  data.sectionOrder = newOrder;
  savePortfolioData(data, false);
  updateLivePreview();
}

/**
 * Setup indicator for auto saving
 */
function setupAutoSaveHooks() {
  const indicator = document.getElementById('save-status');
  if (indicator) {
    indicator.innerHTML = `<i class="fa-solid fa-check text-success"></i> Saved`;
  }
}

/**
 * Demo Data loading action button
 */
function setupDemoDataButton() {
  const demoBtn = document.getElementById('load-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      loadDemoData();
      renderActiveSectionForm();
      updateLivePreview();
    });
  }

  const resetBtn = document.getElementById('reset-portfolio-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all portfolio data to empty?')) {
        resetPortfolioData();
        renderActiveSectionForm();
        updateLivePreview();
      }
    });
  }
}
