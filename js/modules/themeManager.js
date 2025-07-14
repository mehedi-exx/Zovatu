// Theme Management Module
// Handles theme switching and persistence

export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "dark";
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupThemeToggle();
  }

  applyTheme(theme) {
    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(theme + "-mode");
    localStorage.setItem("theme", theme);
    this.currentTheme = theme;
    
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Update CSS custom properties for light theme
    if (theme === "light") {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff');
      document.documentElement.style.setProperty('--bg-secondary', '#f6f8fa');
      document.documentElement.style.setProperty('--bg-tertiary', '#f1f3f4');
      document.documentElement.style.setProperty('--text-primary', '#24292f');
      document.documentElement.style.setProperty('--text-secondary', '#656d76');
      document.documentElement.style.setProperty('--border-primary', '#d0d7de');
    } else {
      // Reset to dark theme values
      document.documentElement.style.setProperty('--bg-primary', '#0d1117');
      document.documentElement.style.setProperty('--bg-secondary', '#161b22');
      document.documentElement.style.setProperty('--bg-tertiary', '#21262d');
      document.documentElement.style.setProperty('--text-primary', '#f0f6fc');
      document.documentElement.style.setProperty('--text-secondary', '#8b949e');
      document.documentElement.style.setProperty('--border-primary', '#30363d');
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    
    // Show toast notification
    const currentLang = window.languageManager ? window.languageManager.getCurrentUILanguage() : 'en';
    const message = currentLang === 'bn' ? 
      `থিম পরিবর্তন করা হয়েছে: ${newTheme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}` :
      `Theme changed to: ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`;
    
    if (window.showToast) {
      window.showToast(message, "info");
    }
  }

  setupThemeToggle() {
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  // Auto theme detection based on system preference
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Listen for system theme changes
  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener((e) => {
        if (!localStorage.getItem("theme")) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();

