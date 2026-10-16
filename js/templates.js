import { escapeHTML } from './utils.js';

export function renderPortfolio(data) {
  if (!data) return '<div class="preview-empty">No portfolio data available</div>';

  const templateName = data.template || 'modern';

  switch (templateName) {
    case 'minimal':
      return renderMinimalTemplate(data);
    case 'creative':
      return renderCreativeTemplate(data);
    case 'modern':
    default:
      return renderModernTemplate(data);
  }
}

function renderOrderedSections(data, sectionRenderers) {
  const order = data.sectionOrder || ["profile", "skills", "experience", "projects", "education", "certifications"];
  return order
    .map(key => {
      const renderer = sectionRenderers[key];
      return renderer ? renderer(data) : '';
    })
    .join('');
}

function renderMinimalTemplate(data) {
  const p = data.profile || {};
  const social = data.social || {};

  const sectionRenderers = {
    profile: () => `
      <section class="tpl-minimal-section tpl-about-section" id="tpl-about">
        <h2 class="tpl-minimal-heading">About Me</h2>
        <p class="tpl-minimal-text">${escapeHTML(p.about || p.bio || 'Add your about details in the builder.')}</p>
      </section>
    `,
    skills: (d) => {
      const skills = d.skills || [];
      if (skills.length === 0) return '';
      return `
        <section class="tpl-minimal-section" id="tpl-skills">
          <h2 class="tpl-minimal-heading">Skills & Competencies</h2>
          <div class="tpl-minimal-skills-grid">
            ${skills.map(s => `
              <div class="tpl-minimal-skill-item">
                <div class="tpl-minimal-skill-header">
                  <span class="tpl-minimal-skill-name">${escapeHTML(s.name)}</span>
                  <span class="tpl-minimal-skill-level">${s.level}%</span>
                </div>
                <div class="tpl-minimal-progress-bar">
                  <div class="tpl-minimal-progress-fill" style="width: ${s.level}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    experience: (d) => {
      const exp = d.experience || [];
      if (exp.length === 0) return '';
      return `
        <section class="tpl-minimal-section" id="tpl-experience">
          <h2 class="tpl-minimal-heading">Professional Experience</h2>
          <div class="tpl-minimal-timeline">
            ${exp.map(x => `
              <div class="tpl-minimal-timeline-item">
                <div class="tpl-minimal-timeline-header">
                  <div>
                    <h3 class="tpl-minimal-role">${escapeHTML(x.title)}</h3>
                    <div class="tpl-minimal-company">${escapeHTML(x.company)} ${x.location ? `• ${escapeHTML(x.location)}` : ''}</div>
                  </div>
                  <div class="tpl-minimal-date">
                    ${escapeHTML(x.startDate || '')} — ${x.current ? 'Present' : escapeHTML(x.endDate || '')}
                  </div>
                </div>
                ${x.description ? `<p class="tpl-minimal-desc">${escapeHTML(x.description)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    projects: (d) => {
      const projects = d.projects || [];
      if (projects.length === 0) return '';
      return `
        <section class="tpl-minimal-section" id="tpl-projects">
          <h2 class="tpl-minimal-heading">Featured Projects</h2>
          <div class="tpl-minimal-projects-list">
            ${projects.map(proj => `
              <div class="tpl-minimal-project-card ${proj.featured ? 'is-featured' : ''}">
                <div class="tpl-minimal-project-content">
                  <div class="tpl-minimal-project-title-row">
                    <h3 class="tpl-minimal-project-title">${escapeHTML(proj.name)}</h3>
                    ${(proj.githubUrl || proj.demoUrl) ? `
                      <div class="tpl-minimal-project-links">
                        ${proj.githubUrl ? `<a href="${escapeHTML(proj.githubUrl)}" target="_blank" rel="noopener" aria-label="GitHub Repository"><i class="fa-brands fa-github"></i> Code</a>` : ''}
                        ${proj.demoUrl ? `<a href="${escapeHTML(proj.demoUrl)}" target="_blank" rel="noopener" aria-label="Live Demo"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  <p class="tpl-minimal-project-desc">${escapeHTML(proj.description || '')}</p>
                  ${proj.technologies && proj.technologies.length > 0 ? `
                    <div class="tpl-minimal-tags">
                      ${proj.technologies.map(t => `<span class="tpl-minimal-tag">${escapeHTML(t)}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    education: (d) => {
      const edu = d.education || [];
      if (edu.length === 0) return '';
      return `
        <section class="tpl-minimal-section" id="tpl-education">
          <h2 class="tpl-minimal-heading">Education</h2>
          <div class="tpl-minimal-timeline">
            ${edu.map(e => `
              <div class="tpl-minimal-timeline-item">
                <div class="tpl-minimal-timeline-header">
                  <div>
                    <h3 class="tpl-minimal-role">${escapeHTML(e.degree)}</h3>
                    <div class="tpl-minimal-company">${escapeHTML(e.institution)} ${e.location ? `• ${escapeHTML(e.location)}` : ''}</div>
                  </div>
                  <div class="tpl-minimal-date">
                    ${escapeHTML(e.startYear || '')} — ${escapeHTML(e.endYear || '')}
                  </div>
                </div>
                ${e.description ? `<p class="tpl-minimal-desc">${escapeHTML(e.description)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    certifications: (d) => {
      const certs = d.certifications || [];
      if (certs.length === 0) return '';
      return `
        <section class="tpl-minimal-section" id="tpl-certifications">
          <h2 class="tpl-minimal-heading">Certifications</h2>
          <div class="tpl-minimal-certs-grid">
            ${certs.map(c => `
              <div class="tpl-minimal-cert-card">
                <div class="tpl-minimal-cert-name">${escapeHTML(c.name)}</div>
                <div class="tpl-minimal-cert-org">${escapeHTML(c.organization)} ${c.issueDate ? `(${escapeHTML(c.issueDate)})` : ''}</div>
                ${c.credentialId ? `<div class="tpl-minimal-cert-id">ID: ${escapeHTML(c.credentialId)}</div>` : ''}
                ${c.credentialUrl ? `<a href="${escapeHTML(c.credentialUrl)}" target="_blank" class="tpl-minimal-cert-link">Verify Credential &rarr;</a>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
  };

  const socialLinksHtml = renderSocialIcons(social);

  return `
    <div class="tpl-minimal-wrapper">
      <header class="tpl-minimal-header">
        <div class="tpl-minimal-profile-row">
          ${p.photo ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.fullName)}" class="tpl-minimal-avatar" />` : ''}
          <div class="tpl-minimal-profile-meta">
            <h1 class="tpl-minimal-name">${escapeHTML(p.fullName || 'Your Name')}</h1>
            <div class="tpl-minimal-title">${escapeHTML(p.title || 'Professional Title')}</div>
            <div class="tpl-minimal-contacts">
              ${p.email ? `<span><i class="fa-solid fa-envelope"></i> ${escapeHTML(p.email)}</span>` : ''}
              ${p.phone ? `<span><i class="fa-solid fa-phone"></i> ${escapeHTML(p.phone)}</span>` : ''}
              ${p.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(p.location)}</span>` : ''}
            </div>
            ${socialLinksHtml ? `<div class="tpl-minimal-socials">${socialLinksHtml}</div>` : ''}
          </div>
        </div>
      </header>

      <main class="tpl-minimal-main">
        ${renderOrderedSections(data, sectionRenderers)}
      </main>

      <footer class="tpl-minimal-footer">
        <p>&copy; ${new Date().getFullYear()} ${escapeHTML(p.fullName || 'Portfolio')}. All rights reserved.</p>
      </footer>
    </div>
  `;
}

function renderModernTemplate(data) {
  const p = data.profile || {};
  const social = data.social || {};

  const sectionRenderers = {
    profile: () => `
      <section class="tpl-modern-card tpl-modern-about" id="tpl-about">
        <div class="tpl-modern-section-title">
          <i class="fa-solid fa-user-gear"></i> About Me
        </div>
        <p class="tpl-modern-bio-text">${escapeHTML(p.about || p.bio || 'Add your bio details in the editor.')}</p>
      </section>
    `,
    skills: (d) => {
      const skills = d.skills || [];
      if (skills.length === 0) return '';

      const categories = {};
      skills.forEach(s => {
        const cat = s.category || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
      });

      return `
        <section class="tpl-modern-card" id="tpl-skills">
          <div class="tpl-modern-section-title">
            <i class="fa-solid fa-code"></i> Skills & Expertise
          </div>
          <div class="tpl-modern-skills-wrapper">
            ${Object.keys(categories).map(cat => `
              <div class="tpl-modern-skill-cat-block">
                <h4 class="tpl-modern-skill-cat-title">${escapeHTML(cat)}</h4>
                <div class="tpl-modern-skills-grid">
                  ${categories[cat].map(s => `
                    <div class="tpl-modern-skill-badge">
                      <div class="tpl-modern-skill-info">
                        <span class="tpl-modern-skill-name">${escapeHTML(s.name)}</span>
                        <span class="tpl-modern-skill-pct">${s.level}%</span>
                      </div>
                      <div class="tpl-modern-progress-bg">
                        <div class="tpl-modern-progress-fill" style="width: ${s.level}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    experience: (d) => {
      const exp = d.experience || [];
      if (exp.length === 0) return '';
      return `
        <section class="tpl-modern-card" id="tpl-experience">
          <div class="tpl-modern-section-title">
            <i class="fa-solid fa-briefcase"></i> Work Experience
          </div>
          <div class="tpl-modern-timeline">
            ${exp.map(x => `
              <div class="tpl-modern-timeline-node">
                <div class="tpl-modern-timeline-dot"></div>
                <div class="tpl-modern-timeline-content">
                  <div class="tpl-modern-timeline-header">
                    <div>
                      <h3 class="tpl-modern-job-title">${escapeHTML(x.title)}</h3>
                      <div class="tpl-modern-company-name">${escapeHTML(x.company)} ${x.location ? `• ${escapeHTML(x.location)}` : ''}</div>
                    </div>
                    <span class="tpl-modern-date-badge">
                      <i class="fa-regular fa-calendar"></i> ${escapeHTML(x.startDate || '')} — ${x.current ? 'Present' : escapeHTML(x.endDate || '')}
                    </span>
                  </div>
                  ${x.description ? `<p class="tpl-modern-job-desc">${escapeHTML(x.description)}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    projects: (d) => {
      const projects = d.projects || [];
      if (projects.length === 0) return '';
      return `
        <section class="tpl-modern-card" id="tpl-projects">
          <div class="tpl-modern-section-title">
            <i class="fa-solid fa-rocket"></i> Projects Showcase
          </div>
          <div class="tpl-modern-projects-grid">
            ${projects.map(proj => `
              <div class="tpl-modern-proj-card ${proj.featured ? 'is-featured' : ''}">
                ${proj.image ? `
                  <div class="tpl-modern-proj-img-wrap">
                    <img src="${escapeHTML(proj.image)}" alt="${escapeHTML(proj.name)}" loading="lazy" />
                    ${proj.featured ? '<span class="tpl-modern-featured-badge"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
                  </div>
                ` : ''}
                <div class="tpl-modern-proj-body">
                  <h3 class="tpl-modern-proj-title">${escapeHTML(proj.name)}</h3>
                  <p class="tpl-modern-proj-desc">${escapeHTML(proj.description || '')}</p>
                  ${proj.technologies && proj.technologies.length > 0 ? `
                    <div class="tpl-modern-proj-techs">
                      ${proj.technologies.map(t => `<span class="tpl-modern-tech-pill">${escapeHTML(t)}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${(proj.githubUrl || proj.demoUrl) ? `
                    <div class="tpl-modern-proj-actions">
                      ${proj.githubUrl ? `<a href="${escapeHTML(proj.githubUrl)}" target="_blank" rel="noopener" class="tpl-modern-btn-outline"><i class="fa-brands fa-github"></i> Code</a>` : ''}
                      ${proj.demoUrl ? `<a href="${escapeHTML(proj.demoUrl)}" target="_blank" rel="noopener" class="tpl-modern-btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    education: (d) => {
      const edu = d.education || [];
      if (edu.length === 0) return '';
      return `
        <section class="tpl-modern-card" id="tpl-education">
          <div class="tpl-modern-section-title">
            <i class="fa-solid fa-graduation-cap"></i> Education
          </div>
          <div class="tpl-modern-timeline">
            ${edu.map(e => `
              <div class="tpl-modern-timeline-node">
                <div class="tpl-modern-timeline-dot"></div>
                <div class="tpl-modern-timeline-content">
                  <div class="tpl-modern-timeline-header">
                    <div>
                      <h3 class="tpl-modern-job-title">${escapeHTML(e.degree)}</h3>
                      <div class="tpl-modern-company-name">${escapeHTML(e.institution)} ${e.location ? `• ${escapeHTML(e.location)}` : ''}</div>
                    </div>
                    <span class="tpl-modern-date-badge">
                      ${escapeHTML(e.startYear || '')} — ${escapeHTML(e.endYear || '')}
                    </span>
                  </div>
                  ${e.description ? `<p class="tpl-modern-job-desc">${escapeHTML(e.description)}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    certifications: (d) => {
      const certs = d.certifications || [];
      if (certs.length === 0) return '';
      return `
        <section class="tpl-modern-card" id="tpl-certifications">
          <div class="tpl-modern-section-title">
            <i class="fa-solid fa-award"></i> Certifications
          </div>
          <div class="tpl-modern-certs-list">
            ${certs.map(c => `
              <div class="tpl-modern-cert-item">
                <div class="tpl-modern-cert-icon"><i class="fa-solid fa-certificate"></i></div>
                <div class="tpl-modern-cert-body">
                  <h4 class="tpl-modern-cert-title">${escapeHTML(c.name)}</h4>
                  <div class="tpl-modern-cert-meta">${escapeHTML(c.organization)} ${c.issueDate ? `• Issued ${escapeHTML(c.issueDate)}` : ''}</div>
                  ${c.credentialId ? `<div class="tpl-modern-cert-id">Credential ID: <code>${escapeHTML(c.credentialId)}</code></div>` : ''}
                </div>
                ${c.credentialUrl ? `<a href="${escapeHTML(c.credentialUrl)}" target="_blank" rel="noopener" class="tpl-modern-cert-link" title="Verify Credential"><i class="fa-solid fa-external-link"></i></a>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
  };

  const socialLinksHtml = renderSocialIcons(social);

  return `
    <div class="tpl-modern-wrapper">
      <header class="tpl-modern-hero">
        <div class="tpl-modern-hero-inner">
          ${p.photo ? `
            <div class="tpl-modern-avatar-wrap">
              <img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.fullName)}" class="tpl-modern-avatar" />
              <div class="tpl-modern-avatar-glow"></div>
            </div>
          ` : ''}
          <div class="tpl-modern-hero-details">
            <h1 class="tpl-modern-name">${escapeHTML(p.fullName || 'Your Name')}</h1>
            <div class="tpl-modern-role">${escapeHTML(p.title || 'Professional Title')}</div>
            <p class="tpl-modern-short-bio">${escapeHTML(p.bio || '')}</p>

            <div class="tpl-modern-contact-bar">
              ${p.email ? `<a href="mailto:${escapeHTML(p.email)}" class="tpl-modern-contact-chip"><i class="fa-solid fa-envelope"></i> ${escapeHTML(p.email)}</a>` : ''}
              ${p.phone ? `<a href="tel:${escapeHTML(p.phone)}" class="tpl-modern-contact-chip"><i class="fa-solid fa-phone"></i> ${escapeHTML(p.phone)}</a>` : ''}
              ${p.location ? `<span class="tpl-modern-contact-chip"><i class="fa-solid fa-location-dot"></i> ${escapeHTML(p.location)}</span>` : ''}
            </div>

            ${socialLinksHtml ? `<div class="tpl-modern-socials">${socialLinksHtml}</div>` : ''}
          </div>
        </div>
      </header>

      <main class="tpl-modern-main">
        ${renderOrderedSections(data, sectionRenderers)}
      </main>

      <footer class="tpl-modern-footer">
        <div>Crafted with <strong>Portfolia</strong></div>
        <div>&copy; ${new Date().getFullYear()} ${escapeHTML(p.fullName || 'Portfolio')}</div>
      </footer>
    </div>
  `;
}

function renderCreativeTemplate(data) {
  const p = data.profile || {};
  const social = data.social || {};

  const sectionRenderers = {
    profile: () => `
      <section class="tpl-creative-block tpl-creative-about-box" id="tpl-about">
        <div class="tpl-creative-badge">BIO</div>
        <h2 class="tpl-creative-h2">About My Vision</h2>
        <p class="tpl-creative-lead">${escapeHTML(p.about || p.bio || 'Share your story in the editor.')}</p>
      </section>
    `,
    skills: (d) => {
      const skills = d.skills || [];
      if (skills.length === 0) return '';
      return `
        <section class="tpl-creative-block" id="tpl-skills">
          <div class="tpl-creative-badge">CAPABILITIES</div>
          <h2 class="tpl-creative-h2">Skills & Toolkit</h2>
          <div class="tpl-creative-skills-grid">
            ${skills.map(s => `
              <div class="tpl-creative-skill-card">
                <div class="tpl-creative-skill-top">
                  <span class="tpl-creative-skill-title">${escapeHTML(s.name)}</span>
                  <span class="tpl-creative-skill-cat">${escapeHTML(s.category || 'Skill')}</span>
                </div>
                <div class="tpl-creative-meter">
                  <div class="tpl-creative-fill" style="width: ${s.level}%"></div>
                </div>
                <div class="tpl-creative-pct">${s.level}% Mastery</div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    experience: (d) => {
      const exp = d.experience || [];
      if (exp.length === 0) return '';
      return `
        <section class="tpl-creative-block" id="tpl-experience">
          <div class="tpl-creative-badge">CAREER</div>
          <h2 class="tpl-creative-h2">Experience Journey</h2>
          <div class="tpl-creative-cards-list">
            ${exp.map(x => `
              <div class="tpl-creative-item-card">
                <div class="tpl-creative-card-top">
                  <div>
                    <h3 class="tpl-creative-role-title">${escapeHTML(x.title)}</h3>
                    <div class="tpl-creative-org">${escapeHTML(x.company)} ${x.location ? `@ ${escapeHTML(x.location)}` : ''}</div>
                  </div>
                  <span class="tpl-creative-tag-date">
                    ${escapeHTML(x.startDate || '')} ${x.current ? '— Present' : `— ${escapeHTML(x.endDate || '')}`}
                  </span>
                </div>
                ${x.description ? `<p class="tpl-creative-card-body">${escapeHTML(x.description)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    projects: (d) => {
      const projects = d.projects || [];
      if (projects.length === 0) return '';
      return `
        <section class="tpl-creative-block" id="tpl-projects">
          <div class="tpl-creative-badge">PORTFOLIO</div>
          <h2 class="tpl-creative-h2">Selected Works</h2>
          <div class="tpl-creative-projects-grid">
            ${projects.map((proj, idx) => `
              <div class="tpl-creative-proj-box ${proj.featured ? 'is-featured' : ''}">
                <div class="tpl-creative-proj-num">0${idx + 1}</div>
                ${proj.image ? `
                  <div class="tpl-creative-img-holder">
                    <img src="${escapeHTML(proj.image)}" alt="${escapeHTML(proj.name)}" />
                  </div>
                ` : ''}
                <div class="tpl-creative-proj-info">
                  <h3 class="tpl-creative-proj-name">${escapeHTML(proj.name)}</h3>
                  <p class="tpl-creative-proj-text">${escapeHTML(proj.description || '')}</p>
                  ${proj.technologies && proj.technologies.length > 0 ? `
                    <div class="tpl-creative-tags">
                      ${proj.technologies.map(t => `<span class="tpl-creative-pill">#${escapeHTML(t)}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${(proj.githubUrl || proj.demoUrl) ? `
                    <div class="tpl-creative-links">
                      ${proj.githubUrl ? `<a href="${escapeHTML(proj.githubUrl)}" target="_blank" rel="noopener" class="tpl-creative-link-btn"><i class="fa-brands fa-github"></i> Repository</a>` : ''}
                      ${proj.demoUrl ? `<a href="${escapeHTML(proj.demoUrl)}" target="_blank" rel="noopener" class="tpl-creative-link-btn primary"><i class="fa-solid fa-rocket"></i> Launch Site</a>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    education: (d) => {
      const edu = d.education || [];
      if (edu.length === 0) return '';
      return `
        <section class="tpl-creative-block" id="tpl-education">
          <div class="tpl-creative-badge">LEARNING</div>
          <h2 class="tpl-creative-h2">Education & Foundation</h2>
          <div class="tpl-creative-cards-list">
            ${edu.map(e => `
              <div class="tpl-creative-item-card">
                <div class="tpl-creative-card-top">
                  <div>
                    <h3 class="tpl-creative-role-title">${escapeHTML(e.degree)}</h3>
                    <div class="tpl-creative-org">${escapeHTML(e.institution)} ${e.location ? `@ ${escapeHTML(e.location)}` : ''}</div>
                  </div>
                  <span class="tpl-creative-tag-date">
                    ${escapeHTML(e.startYear || '')} — ${escapeHTML(e.endYear || '')}
                  </span>
                </div>
                ${e.description ? `<p class="tpl-creative-card-body">${escapeHTML(e.description)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },
    certifications: (d) => {
      const certs = d.certifications || [];
      if (certs.length === 0) return '';
      return `
        <section class="tpl-creative-block" id="tpl-certifications">
          <div class="tpl-creative-badge">CREDENTIALS</div>
          <h2 class="tpl-creative-h2">Accreditations</h2>
          <div class="tpl-creative-certs-grid">
            ${certs.map(c => `
              <div class="tpl-creative-cert-card">
                <i class="fa-solid fa-ribbon tpl-creative-cert-badge-icon"></i>
                <h4 class="tpl-creative-cert-title">${escapeHTML(c.name)}</h4>
                <div class="tpl-creative-cert-issuer">${escapeHTML(c.organization)}</div>
                ${c.credentialId ? `<div class="tpl-creative-cert-id">ID: ${escapeHTML(c.credentialId)}</div>` : ''}
                ${c.credentialUrl ? `<a href="${escapeHTML(c.credentialUrl)}" target="_blank" rel="noopener" class="tpl-creative-cert-btn">Verify Badge &rarr;</a>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
  };

  const socialLinksHtml = renderSocialIcons(social);

  return `
    <div class="tpl-creative-wrapper">
      <div class="tpl-creative-bg-glow"></div>
      <header class="tpl-creative-hero">
        <div class="tpl-creative-hero-grid">
          <div class="tpl-creative-hero-content">
            <div class="tpl-creative-welcome">HELLO THERE, I'M</div>
            <h1 class="tpl-creative-title">${escapeHTML(p.fullName || 'Your Name')}</h1>
            <div class="tpl-creative-subtitle">${escapeHTML(p.title || 'Creative Technologist')}</div>
            <p class="tpl-creative-bio-lead">${escapeHTML(p.bio || '')}</p>

            <div class="tpl-creative-hero-links">
              ${p.email ? `<a href="mailto:${escapeHTML(p.email)}" class="tpl-creative-action-chip"><i class="fa-solid fa-paper-plane"></i> ${escapeHTML(p.email)}</a>` : ''}
              ${p.location ? `<span class="tpl-creative-action-chip"><i class="fa-solid fa-compass"></i> ${escapeHTML(p.location)}</span>` : ''}
            </div>

            ${socialLinksHtml ? `<div class="tpl-creative-socials">${socialLinksHtml}</div>` : ''}
          </div>
          ${p.photo ? `
            <div class="tpl-creative-hero-photo-wrap">
              <div class="tpl-creative-frame">
                <img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.fullName)}" class="tpl-creative-photo" />
              </div>
            </div>
          ` : ''}
        </div>
      </header>

      <main class="tpl-creative-main">
        ${renderOrderedSections(data, sectionRenderers)}
      </main>

      <footer class="tpl-creative-footer">
        <p>Designed with <strong>Portfolia</strong> • ${new Date().getFullYear()}</p>
      </footer>
    </div>
  `;
}

function renderSocialIcons(social) {
  if (!social) return '';

  const platforms = [
    { key: 'github', icon: 'fa-brands fa-github', label: 'GitHub' },
    { key: 'linkedin', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
    { key: 'twitter', icon: 'fa-brands fa-x-twitter', label: 'Twitter/X' },
    { key: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
    { key: 'youtube', icon: 'fa-brands fa-youtube', label: 'YouTube' },
    { key: 'website', icon: 'fa-solid fa-globe', label: 'Website' }
  ];

  const activeLinks = platforms.filter(p => social[p.key] && social[p.key].trim() !== '');
  if (activeLinks.length === 0) return '';

  return activeLinks.map(p => `
    <a href="${escapeHTML(social[p.key])}" target="_blank" rel="noopener" class="social-icon-btn" aria-label="${p.label}" title="${p.label}">
      <i class="${p.icon}"></i>
    </a>
  `).join('');
}
