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
  navbarShrinkClass: 'navbar-scrolled'
};

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

  // Smooth scroll to element
  smoothScrollTo(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
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
    this.navLinks = document.querySelectorAll('.navlist a');
    this.mobileToggle = document.querySelector('.menu-icon');
    this.init();
  }

  init() {
    if (!this.navbar) return;
    
    this.handleScroll();
    this.setupSmoothScroll();
    this.setupMobileMenu();
    this.highlightActiveSection();
  }

  handleScroll() {
    const scrollHandler = () => {
      if (window.scrollY > CONFIG.scrollThreshold) {
        this.navbar.classList.add(CONFIG.navbarShrinkClass);
      } else {
        this.navbar.classList.remove(CONFIG.navbarShrinkClass);
      }
    };

    window.addEventListener('scroll', utils.debounce(scrollHandler, 10));
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle internal links
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);
          
          if (targetSection) {
            utils.smoothScrollTo(targetSection, 80);
            
            // Update active state
            this.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });
  }

  setupMobileMenu() {
    if (!this.mobileToggle) return;

    this.mobileToggle.addEventListener('click', () => {
      const navLinks = document.querySelector('.navlist');
      if (navLinks) {
        navLinks.classList.toggle('active');
        this.mobileToggle.classList.toggle('active');
      }
    });
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
    if ('IntersectionObserver' in window) {
      this.observeElements();
    } else {
      // Fallback for older browsers
      this.elements.forEach(el => el.classList.add('visible'));
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
    const target = parseInt(element.getAttribute('data-target')) || 100;
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
        console.log('📊 Performance Metrics:');
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

      // Performance monitoring (development only)
      if (window.location.hostname === 'localhost') {
        new PerformanceMonitor();
      }

      // Add loaded class to body
      document.body.classList.add('loaded');

      console.log('✅ Portfolio initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing portfolio:', error);
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
