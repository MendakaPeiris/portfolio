/* ================================
   MODERN PORTFOLIO - MAIN SCRIPT
   Professional JavaScript with ES6+
=================================== */

'use strict';

// ================================
// CONFIGURATION
// ================================
const CONFIG = {
  scrollThreshold: 100,
  typingSpeed: 100,
  typingDelay: 2000,
  observerThreshold: 0.1,
  navbarShrinkClass: 'navbar-scrolled',
  scrollOffset: 80,
  mobileNavMaxWidth: 768
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ================================
// UTILITY FUNCTIONS
// ================================
const utils = {
  // Debounce function for performance optimization
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll to element (respects reduced motion)
  smoothScrollTo(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// ================================
// NAVBAR HANDLER
// ================================
class NavbarHandler {
  constructor() {
    this.navbar = document.querySelector('header');
    this.navlist = document.querySelector('.navlist');
    this.navLinks = document.querySelectorAll('.navlist a');
    this.mobileToggle = document.querySelector('.menu-icon');
    this.backdrop = document.getElementById('nav-backdrop');
    this.logoLink = document.querySelector('header .logo');
    this._scrollTicking = false;
    this._onDocumentKeydown = this._onDocumentKeydown.bind(this);
    this._onNavKeydown = this._onNavKeydown.bind(this);
    this._onResize = utils.debounce(this._onResize.bind(this), 150);
    this._navListenersActive = false;
    this.init();
  }

  init() {
    if (!this.navbar) return;

    this._enhanceNavAccessibility();
    this.handleScroll();
    this.setupSmoothScroll();
    this.setupInPageAnchors();
    this.setupLogoHome();
    this.setupMobileMenu();
    this.highlightActiveSection();
    window.addEventListener('resize', this._onResize);
  }

  _enhanceNavAccessibility() {
    if (this.navlist && !this.navlist.id) {
      this.navlist.id = 'primary-nav';
    }
    if (this.navlist) {
      this.navlist.setAttribute('role', 'navigation');
      this.navlist.setAttribute('aria-label', 'Primary');
    }
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('role', 'button');
      this.mobileToggle.setAttribute('tabindex', '0');
      this.mobileToggle.setAttribute('aria-controls', this.navlist ? this.navlist.id : '');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  closeMobileMenu(options = {}) {
    const { skipFocus = false } = options;
    if (!this.navlist) return;
    this.navlist.classList.remove('active');
    if (this.mobileToggle) {
      this.mobileToggle.classList.remove('active');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      this.mobileToggle.setAttribute('aria-label', 'Open menu');
    }
    document.body.classList.remove('menu-open');
    if (this.backdrop) {
      this.backdrop.classList.remove('is-visible');
      this.backdrop.setAttribute('aria-hidden', 'true');
    }
    if (this._navListenersActive) {
      this._navListenersActive = false;
      this.navlist.removeEventListener('keydown', this._onNavKeydown);
      document.removeEventListener('keydown', this._onDocumentKeydown);
    }
    const isMobile = window.matchMedia(`(max-width: ${CONFIG.mobileNavMaxWidth}px)`).matches;
    if (!skipFocus && isMobile && this.mobileToggle && typeof this.mobileToggle.focus === 'function') {
      this.mobileToggle.focus();
    }
  }

  syncMenuState() {
    const open = this.navlist && this.navlist.classList.contains('active');
    document.body.classList.toggle('menu-open', Boolean(open));
    if (this.mobileToggle) {
      this.mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.mobileToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (this.backdrop) {
      this.backdrop.classList.toggle('is-visible', Boolean(open));
      this.backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (open) {
      if (!this._navListenersActive) {
        this._navListenersActive = true;
        document.addEventListener('keydown', this._onDocumentKeydown);
        this.navlist.addEventListener('keydown', this._onNavKeydown);
      }
      const first = this.navLinks[0];
      if (first && typeof first.focus === 'function') {
        requestAnimationFrame(() => first.focus());
      }
    } else if (this._navListenersActive) {
      this._navListenersActive = false;
      this.navlist.removeEventListener('keydown', this._onNavKeydown);
      document.removeEventListener('keydown', this._onDocumentKeydown);
    }
  }

  _onDocumentKeydown(e) {
    if (e.key === 'Escape') {
      this.closeMobileMenu();
    }
  }

  _onNavKeydown(e) {
    if (e.key !== 'Tab' || !this.navlist.classList.contains('active')) return;
    const focusables = [...this.navLinks];
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  _onResize() {
    if (window.innerWidth > CONFIG.mobileNavMaxWidth) {
      this.closeMobileMenu({ skipFocus: true });
    }
  }

  handleScroll() {
    const scrollHandler = () => {
      if (window.scrollY > CONFIG.scrollThreshold) {
        this.navbar.classList.add(CONFIG.navbarShrinkClass);
      } else {
        this.navbar.classList.remove(CONFIG.navbarShrinkClass);
      }
      this._scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!this._scrollTicking) {
        this._scrollTicking = true;
        requestAnimationFrame(scrollHandler);
      }
    });
  }

  setupSmoothScroll() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);

          if (targetSection) {
            utils.smoothScrollTo(targetSection, CONFIG.scrollOffset);

            this.navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
            if (window.matchMedia(`(max-width: ${CONFIG.mobileNavMaxWidth}px)`).matches) {
              this.closeMobileMenu();
            }
          }
        }
      });
    });
  }

  /** Hero CTAs and any other in-page #hash links outside .navlist */
  setupInPageAnchors() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.closest('.navlist')) return;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      utils.smoothScrollTo(target, CONFIG.scrollOffset);
      if (window.matchMedia(`(max-width: ${CONFIG.mobileNavMaxWidth}px)`).matches) {
        this.closeMobileMenu();
      }
      this.navLinks.forEach((l) => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    });
  }

  setupLogoHome() {
    if (!this.logoLink) return;
    this.logoLink.addEventListener('click', (e) => {
      const href = this.logoLink.getAttribute('href');
      if (href !== '#' && href !== '#home') return;
      e.preventDefault();
      const home = document.getElementById('home');
      if (home) {
        utils.smoothScrollTo(home, CONFIG.scrollOffset);
      } else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      this.navLinks.forEach((l) => l.classList.remove('active'));
      const homeLink = document.querySelector('.navlist a[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
      if (window.matchMedia(`(max-width: ${CONFIG.mobileNavMaxWidth}px)`).matches) {
        this.closeMobileMenu();
      }
    });
  }

  setupMobileMenu() {
    if (!this.mobileToggle) return;

    const toggleMenu = () => {
      if (this.navlist) {
        this.navlist.classList.toggle('active');
        this.mobileToggle.classList.toggle('active');
        this.syncMenuState();
      }
    };

    this.mobileToggle.addEventListener('click', toggleMenu);
    this.mobileToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeMobileMenu());
    }
  }

  highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: CONFIG.observerThreshold,
      rootMargin: '-100px'
    });

    sections.forEach(section => observer.observe(section));
  }
}

// ================================
// TYPING ANIMATION
// ================================
class TypingAnimation {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = Array.isArray(texts) ? texts : [texts];
    this.speed = options.speed || CONFIG.typingSpeed;
    this.delay = options.delay || CONFIG.typingDelay;
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    
    if (this.element) {
      this.start();
    }
  }

  start() {
    if (prefersReducedMotion()) {
      this.element.textContent = this.texts[0] || '';
      return;
    }
    this.type();
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
      this.currentCharIndex++;
    }

    let typeSpeed = this.speed;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      typeSpeed = this.delay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ================================
// SCROLL ANIMATIONS
// ================================
class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.animate-on-scroll, .section, .project-item, .skills-grid span');
    this.init();
  }

  init() {
    if (prefersReducedMotion()) {
      this.elements.forEach((el) => {
        el.classList.add('fade-in-up');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('transition');
      });
      return;
    }
    if ('IntersectionObserver' in window) {
      this.observeElements();
    } else {
      this.elements.forEach((el) => el.classList.add('visible'));
    }
  }

  observeElements() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    this.elements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(element);
    });
  }
}

// ================================
// SKILLS COUNTER ANIMATION
// ================================
class CounterAnimation {
  constructor(selector) {
    this.counters = document.querySelectorAll(selector);
    this.animated = new Set();
    this.init();
  }

  init() {
    if (this.counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated.has(entry.target)) {
          this.animateCounter(entry.target);
          this.animated.add(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10) || 100;
    if (prefersReducedMotion()) {
      element.textContent = String(target);
      return;
    }
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }
}

// ================================
// THEME TOGGLE (Optional)
// ================================
class ThemeToggle {
  constructor() {
    this.toggle = document.querySelector('.theme-toggle');
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (this.toggle) {
      this.init();
    }
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.toggle.addEventListener('click', () => this.switchTheme());
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = this.toggle && this.toggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    if (this.toggle) {
      this.toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      this.toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  switchTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
  }
}

// ================================
// PERFORMANCE MONITOR
// ================================
class PerformanceMonitor {
  constructor() {
    this.logPerformance();
  }

  logPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Performance metrics:');
        console.log(`Page Load: ${(perfData.loadEventEnd - perfData.fetchStart).toFixed(2)}ms`);
        console.log(`DOM Ready: ${(perfData.domContentLoadedEventEnd - perfData.fetchStart).toFixed(2)}ms`);
      });
    }
  }
}

// ================================
// INITIALIZE APPLICATION
// ================================
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Core functionality
      new NavbarHandler();
      new ScrollAnimations();
      
      // Optional: Typing animation for hero section
      const typingElement = document.querySelector('.typing');
      if (typingElement) {
        new TypingAnimation(typingElement, [
          'Full Stack Developer',
          'UI/UX Designer',
          'Problem Solver',
          'Creative Thinker'
        ]);
      }

      // Optional: Counter animations
      new CounterAnimation('.counter');

      // Optional: Theme toggle
      new ThemeToggle();

      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (isLocal) {
        new PerformanceMonitor();
        console.log('Portfolio initialized');
      }

      document.body.classList.add('loaded');
    } catch (error) {
      console.error('Error initializing portfolio:', error);
    }
  }
}

// Start the application
new App();

// ================================
// EXPORT FOR MODULE USAGE (Optional)
// ================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, NavbarHandler, TypingAnimation, ScrollAnimations };
}
