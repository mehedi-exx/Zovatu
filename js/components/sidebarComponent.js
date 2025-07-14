// Sidebar Component
// Handles sidebar functionality and navigation

export class SidebarComponent {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.isOpen = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.sidebar.classList.add("open");
    this.isOpen = true;
    
    // Add backdrop for mobile
    this.createBackdrop();
    
    // Focus management
    this.trapFocus();
    
    // Prevent body scroll on mobile
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    this.sidebar.classList.remove("open");
    this.isOpen = false;
    
    // Remove backdrop
    this.removeBackdrop();
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to menu button
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
      menuBtn.focus();
    }
  }

  createBackdrop() {
    // Remove existing backdrop
    this.removeBackdrop();
    
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    backdrop.onclick = () => this.close();
    document.body.appendChild(backdrop);
    
    // Trigger animation
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
    });
  }

  removeBackdrop() {
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) {
      backdrop.style.opacity = '0';
      setTimeout(() => {
        if (backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
      }, 300);
    }
  }

  setupEventListeners() {
    // Menu button click
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggle());
    }

    // Close button click
    const closeBtn = document.querySelector('.close-sidebar');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on outside click (desktop)
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.sidebar.contains(e.target) && 
          !e.target.closest('.menu-btn') &&
          window.innerWidth > 768) {
        this.close();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.close();
      }
    });
  }

  setupKeyboardNavigation() {
    const sidebarLinks = this.sidebar.querySelectorAll('a, button');
    
    sidebarLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          // Handle tab navigation within sidebar
          if (e.shiftKey && index === 0) {
            // Shift+Tab on first element, go to close button
            e.preventDefault();
            const closeBtn = this.sidebar.querySelector('.close-sidebar');
            if (closeBtn) closeBtn.focus();
          } else if (!e.shiftKey && index === sidebarLinks.length - 1) {
            // Tab on last element, go to close button
            e.preventDefault();
            const closeBtn = this.sidebar.querySelector('.close-sidebar');
            if (closeBtn) closeBtn.focus();
          }
        }
      });
    });
  }

  trapFocus() {
    const focusableElements = this.sidebar.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstElement.focus();
    
    // Trap focus within sidebar
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    this.sidebar.addEventListener('keydown', handleTabKey);
    
    // Remove event listener when sidebar closes
    const originalClose = this.close.bind(this);
    this.close = () => {
      this.sidebar.removeEventListener('keydown', handleTabKey);
      originalClose();
    };
  }

  // Update active navigation item
  updateActiveNavigation(currentPage) {
    const navLinks = this.sidebar.querySelectorAll('a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // Add navigation item
  addNavigationItem(href, text, icon, position = 'append') {
    const navItem = document.createElement('a');
    navItem.href = href;
    navItem.innerHTML = `<i class="${icon}"></i> ${text}`;
    
    if (position === 'prepend') {
      this.sidebar.insertBefore(navItem, this.sidebar.firstChild);
    } else {
      this.sidebar.appendChild(navItem);
    }
    
    return navItem;
  }

  // Remove navigation item
  removeNavigationItem(href) {
    const navItem = this.sidebar.querySelector(`a[href="${href}"]`);
    if (navItem) {
      navItem.remove();
    }
  }

  // Get current state
  getState() {
    return {
      isOpen: this.isOpen,
      hasBackdrop: !!document.querySelector('.sidebar-backdrop')
    };
  }
}

// Export singleton instance
export const sidebarComponent = new SidebarComponent();

