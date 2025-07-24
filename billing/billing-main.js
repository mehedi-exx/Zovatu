/**
 * Zovatu Smart Billing Tool - Main Integration File
 * Initializes and coordinates all billing system components
 */

// Global application state
window.ZovatuBilling = {
    storage: null,
    core: null,
    ui: null,
    isInitialized: false,
    version: '2.0.0'
};

/**
 * Initialize the complete billing system
 */
async function initializeBillingSystem() {
    try {
        console.log('🚀 Initializing Zovatu Smart Billing Tool v' + window.ZovatuBilling.version);
        
        // Show loading screen
        showLoadingScreen();
        
        // Initialize storage system
        window.ZovatuBilling.storage = new ZovatuStorage();
        console.log('✅ Storage system initialized');
        
        // Initialize core billing logic
        window.ZovatuBilling.core = new ZovatuBillingCore(window.ZovatuBilling.storage);
        console.log('✅ Core billing logic initialized');
        
        // Initialize UI system
        window.ZovatuBilling.ui = new ZovatuBillingUI();
        console.log('✅ UI system initialized');
        
        // Setup global error handling
        setupGlobalErrorHandling();
        
        // Setup performance monitoring
        setupPerformanceMonitoring();
        
        // Mark as initialized
        window.ZovatuBilling.isInitialized = true;
        
        console.log('🎉 Zovatu Smart Billing Tool initialized successfully!');
        
        // Hide loading screen
        hideLoadingScreen();
        
    } catch (error) {
        console.error('❌ Failed to initialize billing system:', error);
        showInitializationError(error);
    }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingHTML = `
        <div id="systemLoadingScreen" class="loading-overlay">
            <div class="loading-content">
                <div class="loading-logo">
                    <i class="fas fa-toolbox"></i>
                    <h2>Zovatu</h2>
                </div>
                <div class="loading-spinner"></div>
                <p class="loading-text">Initializing Smart Billing Tool...</p>
                <div class="loading-progress">
                    <div class="progress-bar" id="loadingProgress"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
    
    // Animate progress bar
    let progress = 0;
    const progressBar = document.getElementById('loadingProgress');
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            clearInterval(interval);
            progress = 90;
        }
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }, 100);
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('systemLoadingScreen');
    if (loadingScreen) {
        // Complete progress bar
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        // Fade out after a short delay
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
            }, 300);
        }, 500);
    }
}

/**
 * Show initialization error
 */
function showInitializationError(error) {
    const errorHTML = `
        <div id="initializationError" class="error-overlay">
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Initialization Failed</h2>
                <p>The billing system failed to initialize properly.</p>
                <div class="error-details">
                    <strong>Error:</strong> ${error.message || 'Unknown error'}
                </div>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                    <button onclick="clearAllData()" class="btn btn-secondary">
                        <i class="fas fa-trash"></i> Clear Data & Retry
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove loading screen
    const loadingScreen = document.getElementById('systemLoadingScreen');
    if (loadingScreen) loadingScreen.remove();
    
    document.body.insertAdjacentHTML('beforeend', errorHTML);
}

/**
 * Setup global error handling
 */
function setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error);
        if (window.ZovatuBilling.ui && window.ZovatuBilling.ui.showToast) {
            window.ZovatuBilling.ui.showToast('An unexpected error occurred', 'error');
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        if (window.ZovatuBilling.ui && window.ZovatuBilling.ui.showToast) {
            window.ZovatuBilling.ui.showToast('A system error occurred', 'error');
        }
    });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('📊 Page Load Performance:', {
            loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
        });
    });
    
    // Monitor memory usage (if available)
    if (performance.memory) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                console.warn('⚠️ High memory usage detected');
                if (window.ZovatuBilling.ui && window.ZovatuBilling.ui.showToast) {
                    window.ZovatuBilling.ui.showToast('High memory usage detected. Consider refreshing the page.', 'warning');
                }
            }
        }, 30000); // Check every 30 seconds
    }
}

/**
 * Clear all data and retry initialization
 */
function clearAllData() {
    if (confirm('This will delete all your data including shop profile, products, and bills. Are you sure?')) {
        localStorage.clear();
        location.reload();
    }
}

/**
 * Export system data for debugging
 */
function exportSystemData() {
    if (!window.ZovatuBilling.storage) {
        console.error('Storage system not initialized');
        return;
    }
    
    const systemData = {
        version: window.ZovatuBilling.version,
        timestamp: new Date().toISOString(),
        storage: window.ZovatuBilling.storage.getStorageStats(),
        settings: window.ZovatuBilling.storage.getSettings(),
        analytics: window.ZovatuBilling.storage.getAnalytics()
    };
    
    console.log('📋 System Data:', systemData);
    return systemData;
}

/**
 * Health check function
 */
function performHealthCheck() {
    const health = {
        storage: !!window.ZovatuBilling.storage,
        core: !!window.ZovatuBilling.core,
        ui: !!window.ZovatuBilling.ui,
        initialized: window.ZovatuBilling.isInitialized,
        localStorage: typeof Storage !== 'undefined',
        chartJS: typeof Chart !== 'undefined'
    };
    
    console.log('🏥 System Health Check:', health);
    
    const allHealthy = Object.values(health).every(status => status === true);
    
    if (!allHealthy) {
        console.warn('⚠️ System health issues detected');
        if (window.ZovatuBilling.ui && window.ZovatuBilling.ui.showToast) {
            window.ZovatuBilling.ui.showToast('System health issues detected. Some features may not work properly.', 'warning');
        }
    }
    
    return health;
}

/**
 * Utility functions for global access
 */
window.ZovatuUtils = {
    formatCurrency: (amount) => {
        if (window.ZovatuBilling.core) {
            return window.ZovatuBilling.core.formatCurrency(amount);
        }
        return '$' + (amount || 0).toFixed(2);
    },
    
    formatDate: (date) => {
        return new Date(date).toLocaleDateString();
    },
    
    formatDateTime: (date) => {
        return new Date(date).toLocaleString();
    },
    
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    debounce: (func, wait) => {
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
    
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Keyboard shortcuts for power users
 */
function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + key combinations
        if (e.altKey) {
            switch (e.key) {
                case 'h':
                    e.preventDefault();
                    performHealthCheck();
                    break;
                case 'd':
                    e.preventDefault();
                    exportSystemData();
                    break;
                case 'r':
                    e.preventDefault();
                    if (confirm('Reload the application?')) {
                        location.reload();
                    }
                    break;
            }
        }
    });
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded');
    
    // Setup global shortcuts
    setupGlobalKeyboardShortcuts();
    
    // Initialize the billing system
    initializeBillingSystem();
    
    // Setup periodic health checks
    setInterval(performHealthCheck, 300000); // Every 5 minutes
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('👁️ Page became visible');
        // Refresh data when page becomes visible
        if (window.ZovatuBilling.isInitialized && window.ZovatuBilling.ui) {
            window.ZovatuBilling.ui.checkLowStockAlerts();
        }
    } else {
        console.log('🙈 Page became hidden');
        // Auto-save when page becomes hidden
        if (window.ZovatuBilling.isInitialized && window.ZovatuBilling.ui) {
            window.ZovatuBilling.ui.autoSave();
        }
    }
});

/**
 * Handle before page unload
 */
window.addEventListener('beforeunload', (e) => {
    if (window.ZovatuBilling.isInitialized) {
        // Auto-save before leaving
        if (window.ZovatuBilling.ui) {
            window.ZovatuBilling.ui.autoSave();
        }
        
        // Check for unsaved changes
        const cart = window.ZovatuBilling.core ? window.ZovatuBilling.core.getCart() : [];
        if (cart.length > 0) {
            e.preventDefault();
            e.returnValue = 'You have items in your cart. Are you sure you want to leave?';
            return e.returnValue;
        }
    }
});

// Export for debugging
window.ZovatuBilling.utils = {
    exportSystemData,
    performHealthCheck,
    clearAllData,
    initializeBillingSystem
};

