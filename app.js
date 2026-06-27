/* ============================================
   APP.JS — Main Application Logic
   Data loading, navigation, animations, typing
   ============================================ */

(function () {
  let portfolioData = null;

  // ─── Data Loading ───────────────────────────────
  async function loadData() {
    try {
      const res = await fetch('data.json');
      portfolioData = await res.json();
      populateDOM();
      initTypewriter();
      initScrollAnimations();
    } catch (err) {
      console.error('Failed to load data.json:', err);
    }
  }

  // ─── Populate DOM from data.json ────────────────
  function populateDOM() {
    const d = portfolioData;

    // Hero
    setText('hero-greeting', d.greeting + ' 👋');
    setText('hero-subtitle', d.subtitle);
    setText('hero-description', d.bio);
    document.querySelector('.navbar-logo').textContent = d.name;
    const avatarFallback = document.getElementById('hero-avatar-fallback');
    if (avatarFallback) avatarFallback.textContent = d.name.split(' ').map(n => n[0]).join('');

    if (d.resume_url) {
      document.getElementById('resume-btn').href = d.resume_url;
    }

    // Social icons
    const socialHTML = buildSocialIcons(d.social);
    setHTML('hero-social', socialHTML);
    setHTML('contact-social', socialHTML);
    setHTML('footer-social', socialHTML);

    // About
    setText('about-bio', d.bio);
    setText('about-email', d.email);
    setText('about-location', d.location);
    if (d.education && d.education.length > 0) {
      setText('about-education', d.education[0].degree);
    }

    // Core Areas badges
    const badgesHTML = d.core_areas.map(area =>
      `<span class="badge">${area}</span>`
    ).join('');
    setHTML('core-areas-badges', badgesHTML);

    // Education cards
    const eduHTML = d.education.map(edu => `
      <div class="edu-card">
        <h4>${edu.degree}</h4>
        <p class="edu-institution">${edu.institution}</p>
        <div class="edu-meta">
          <span>${edu.period}</span>
          <span>${edu.score}</span>
        </div>
      </div>
    `).join('');
    setHTML('education-list', eduHTML);

    // Skills
    populateSkills();

    // Projects
    populateProjects();

    // Experience
    populateExperience();

    // Achievements
    populateAchievements();

    // Contact
    setText('contact-email', d.email);
    setText('contact-phone', d.phone);
    setText('contact-location', d.location);

    // Footer year
    setText('footer-year', new Date().getFullYear().toString());
  }

  function buildSocialIcons(social) {
    const icons = {
      github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
      email: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`,
    };

    return Object.entries(social).map(([key, url]) => {
      if (!url) return '';
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="social-icon" title="${key}">${icons[key] || ''}</a>`;
    }).join('');
  }

  function populateSkills() {
    const skills = portfolioData.skills;
    const tabNames = { programming: 'Programming Languages', frontend: 'Frontend Development', backend: 'Backend Development', cloud: 'Cloud & Deployment' };
    const tabIcons = {
      programming: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>`,
      frontend: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
      backend: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,
      cloud: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>`,
    };

    Object.keys(tabNames).forEach(key => {
      const panel = document.getElementById(`panel-${key}`);
      if (!panel || !skills[key]) return;

      const items = skills[key];
      const fallbackIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>`;
      const gridHTML = items.map(skill => {
        const iconHTML = skill.icon
          ? `<img src="${skill.icon}" alt="${skill.name}" width="32" height="32" style="width:32px;height:32px;object-fit:contain" onerror="this.remove()">`
          : fallbackIcon;
        return `
          <div class="skill-card">
            <div class="skill-icon">${iconHTML}</div>
            <h4>${skill.name}</h4>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="skills-content">
          <h3 class="skills-content-header text-gradient">
            ${tabIcons[key]} <span>${tabNames[key]}</span>
          </h3>
          <div class="skills-grid">${gridHTML}</div>
        </div>
      `;
    });

    // Tools
    if (skills.tools) {
      const toolsHTML = skills.tools.map(t => `<span class="tool-tag">${t}</span>`).join('');
      setHTML('tools-wrap', toolsHTML);
    }
  }

  function populateProjects() {
    const projects = portfolioData.projects;
    const sparkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>`;

    const html = projects.map((proj, i) => {
      const accentColor = extractGradientColor(proj.gradient);
      const techHTML = proj.tech_stack.map(t => `
        <div class="tech-badge">
          ${t.icon ? `<img src="${t.icon}" alt="${t.name}" onerror="this.style.display='none'">` : ''}
          <span>${t.name}</span>
        </div>
      `).join('');

      const featuresHTML = proj.features.map(f => `
        <div class="project-feature-item">
          ${sparkSVG}
          <span>${f}</span>
        </div>
      `).join('');

      const isReversed = i % 2 === 1;

      return `
        <div class="project-block animate-on-scroll">
          <div class="project-inner" style="${isReversed ? 'flex-direction: column-reverse;' : ''}">
            <div class="project-visual" style="order: ${isReversed ? 2 : 1}">
              <div class="project-visual-frame">
                <div class="project-visual-inner" style="background: ${proj.gradient || 'radial-gradient(circle, #2563eb, #1e1b4b)'}">
                  <h1 class="project-title-visual">${proj.name}: ${proj.description}</h1>
                  <div class="project-screenshot-wrap">
                    <div class="project-screenshot-frame" style="transform: rotate(${isReversed ? '-2deg' : '2deg'})">
                      <img src="${proj.image}" alt="${proj.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22 fill=%22%23111827%22%3E%3Crect width=%22800%22 height=%22400%22/%3E%3Ctext x=%22400%22 y=%22200%22 fill=%22%234b5563%22 text-anchor=%22middle%22 font-family=%22Inter%22 font-size=%2224%22%3E${proj.name}%3C/text%3E%3C/svg%3E'">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="project-info" style="order: ${isReversed ? 1 : 2}">
              <div class="project-header">
                <div class="project-accent-bar" style="background:${accentColor}"></div>
                <h2>${proj.name}</h2>
                ${proj.live_url ? `<a href="${proj.live_url}" target="_blank" class="project-checkout-btn">Check out <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7h-10"/></svg></a>` : ''}
              </div>
              <p class="project-description">${proj.description}</p>
              <div class="project-features">${featuresHTML}</div>
              <div class="project-tech-stack">${techHTML}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    setHTML('projects-list', html);
  }

  function extractGradientColor(gradient) {
    if (!gradient) return '#2563eb';
    const match = gradient.match(/#[0-9a-f]{6}/i);
    return match ? match[0] : '#2563eb';
  }

  function populateExperience() {
    const exps = portfolioData.experience;
    const html = exps.map(exp => `
      <div class="exp-card animate-on-scroll">
        <div class="exp-role">${exp.role}</div>
        <div class="exp-company">${exp.company}</div>
        <div class="exp-period">${exp.period}</div>
        <p class="exp-description">${exp.description}</p>
        ${exp.certificate_image ? `
          <button class="exp-cert-btn" onclick="openCertModal('${exp.certificate_image}', '${exp.role} — ${exp.company}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2z"/><path d="M14 2v6h6"/></svg>
            Experience Certificate
          </button>
        ` : ''}
      </div>
    `).join('');
    setHTML('experience-list', html);
  }

  function populateAchievements() {
    const achs = portfolioData.achievements;
    const iconMap = { trophy: '🏆', certificate: '📜', award: '🎖️' };
    const html = achs.map(ach => `
      <div class="achievement-card animate-on-scroll">
        <div class="achievement-icon">${iconMap[ach.icon] || '🏅'}</div>
        <h4>${ach.title}</h4>
        <p>${ach.event}</p>
      </div>
    `).join('');
    setHTML('achievements-grid', html);
  }

  // ─── Typewriter Animation ──────────────────────
  function initTypewriter() {
    const roles = portfolioData.typing_roles || ['Developer'];
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    function type() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        el.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentRole.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 500;
      }

      timeout = setTimeout(type, speed);
    }

    type();
  }

  // ─── Navigation ─────────────────────────────────
  function initNavigation() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Navbar bg on scroll
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scroll progress bar
      if (scrollY > window.innerHeight * 0.5) {
        scrollProgress.classList.add('visible');
      } else {
        scrollProgress.classList.remove('visible');
      }

      updateScrollProgress();
      updateActiveNavLink();
    });

    // Nav link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const section = link.dataset.section;
        scrollToSection(section);
        closeMobileNav();
      });
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn').addEventListener('click', openMobileNav);
    document.getElementById('mobile-nav-close').addEventListener('click', closeMobileNav);
    document.getElementById('mobile-overlay').addEventListener('click', closeMobileNav);

    // Nav indicator initial position
    updateNavIndicator();
  }

  function updateScrollProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    const percent = Math.round((scrollY / scrollHeight) * 100);

    const fill = document.getElementById('progress-fill');
    const percentEl = document.getElementById('progress-percent');
    const remainingEl = document.getElementById('progress-remaining');
    const sectionText = document.getElementById('progress-section-text');

    if (fill) fill.style.width = percent + '%';
    if (percentEl) percentEl.textContent = percent + '%';
    if (remainingEl) remainingEl.textContent = (100 - percent) + '% remaining';

    // Current section name
    const sections = ['intro', 'about', 'skills', 'projects', 'experience', 'achievements', 'contact'];
    let current = 'intro';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) {
        current = id;
      }
    });
    if (sectionText) sectionText.textContent = current;
  }

  function updateActiveNavLink() {
    const sections = ['intro', 'about', 'skills', 'projects', 'experience', 'contact'];
    let current = 'intro';

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
        current = id;
      }
    });

    document.querySelectorAll('.navbar-pill .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });

    updateNavIndicator();
  }

  function updateNavIndicator() {
    const activeLink = document.querySelector('.navbar-pill .nav-link.active');
    const indicator = document.getElementById('nav-indicator');
    if (!activeLink || !indicator) return;

    const pill = activeLink.closest('.navbar-pill');
    const pillRect = pill.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    indicator.style.left = (linkRect.left - pillRect.left) + 'px';
    indicator.style.top = '5px';
    indicator.style.width = linkRect.width + 'px';
    indicator.style.height = (linkRect.height) + 'px';
    indicator.style.opacity = '1';
  }

  function openMobileNav() {
    document.getElementById('mobile-nav').classList.add('open');
    document.getElementById('mobile-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    document.getElementById('mobile-nav').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('show');
    document.body.style.overflow = '';
  }

  // ─── Scroll Animations ─────────────────────────
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  // ─── Skills Tab Switching ──────────────────────
  function initSkillsTabs() {
    document.querySelectorAll('.skill-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding panel
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`panel-${tab.dataset.tab}`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ─── Certificate Modal ─────────────────────────
  window.openCertModal = function (imageSrc, title) {
    const modal = document.getElementById('cert-modal');
    document.getElementById('cert-modal-img').src = imageSrc;
    document.getElementById('cert-modal-title').textContent = title;
    modal.classList.add('open');
  };

  document.getElementById('cert-modal-close').addEventListener('click', () => {
    document.getElementById('cert-modal').classList.remove('open');
  });

  document.getElementById('cert-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.remove('open');
    }
  });

  // ─── Contact Form ──────────────────────────────
  window.handleContactSubmit = function (e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = '✓ Message Sent!';
    btn.style.background = '#059669';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  };

  // ─── Scroll to Section ─────────────────────────
  window.scrollToSection = function (sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ─── Helpers ───────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // ─── Init ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initNavigation();
    initSkillsTabs();
  });
})();
