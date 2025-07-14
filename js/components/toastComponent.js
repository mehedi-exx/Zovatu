// Toast Notification Component
// Handles toast notifications with queue management

export class ToastComponent {
  constructor() {
    this.toasts = [];
    this.maxToasts = 5;
    this.defaultDuration = 4000;
    this.container = this.createContainer();
  }

  createContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  show(message, type = 'info', duration = this.defaultDuration) {
    // Remove oldest toast if we have too many
    if (this.toasts.length >= this.maxToasts) {
      this.remove(this.toasts[0]);
    }

    const toast = this.createToast(message, type, duration);
    this.toasts.push(toast);
    this.container.appendChild(toast.element);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.element.classList.add('show');
    });

    // Auto remove after duration
    if (duration > 0) {
      toast.timeout = setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      padding: 12px 20px;
      border-radius: var(--radius-md);
      color: white;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: var(--shadow-lg);
      font-size: 14px;
      max-width: 400px;
      pointer-events: auto;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    `;

    // Set background color based on type
    const colors = {
      success: 'var(--accent-primary)',
      error: 'var(--accent-danger)',
      warning: 'var(--accent-warning)',
      info: 'var(--accent-info)'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // Add icon based on type
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        font-size: 16px;
        opacity: 0.7;
        transition: opacity 0.2s ease;
      ">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add progress bar for timed toasts
    if (duration > 0) {
      const progressBar = document.createElement('div');
      progressBar.className = 'toast-progress';
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
        width: 100%;
        transform-origin: left;
        animation: toastProgress ${duration}ms linear;
      `;
      toast.appendChild(progressBar);

      // Add CSS animation for progress bar
      if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
          @keyframes toastProgress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          .toast.show { transform: translateX(0); }
          .toast-close:hover { opacity: 1; }
        `;
        document.head.appendChild(style);
      }
    }

    const toastObj = {
      element: toast,
      type: type,
      message: message,
      duration: duration,
      timeout: null
    };

    // Add event listeners
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove(toastObj);
    });

    // Click to dismiss
    toast.addEventListener('click', () => {
      this.remove(toastObj);
    });

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
      if (toastObj.timeout) {
        clearTimeout(toastObj.timeout);
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
          progressBar.style.animationPlayState = 'paused';
        }
      }
    });

    // Resume on mouse leave
    toast.addEventListener('mouseleave', () => {
      if (duration > 0) {
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
          progressBar.style.animationPlayState = 'running';
        }
        // Calculate remaining time and set new timeout
        const remainingTime = duration * 0.3; // Approximate remaining time
        toastObj.timeout = setTimeout(() => {
          this.remove(toastObj);
        }, remainingTime);
      }
    });

    return toastObj;
  }

  remove(toast) {
    if (!toast || !toast.element) return;

    // Clear timeout
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }

    // Remove from array
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }

    // Animate out
    toast.element.style.transform = 'translateX(100%)';
    toast.element.style.opacity = '0';

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
    }, 300);
  }

  removeAll() {
    this.toasts.forEach(toast => this.remove(toast));
  }

  // Convenience methods
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  // Update mobile styles
  updateMobileStyles() {
    if (window.innerWidth <= 768) {
      this.container.style.cssText = `
        position: fixed;
        top: 80px;
        left: 12px;
        right: 12px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
    } else {
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
    }
  }

  // Initialize responsive behavior
  init() {
    this.updateMobileStyles();
    window.addEventListener('resize', () => this.updateMobileStyles());
  }
}

// Export singleton instance
export const toastComponent = new ToastComponent();

// Initialize on creation
toastComponent.init();

