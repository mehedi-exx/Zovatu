// Authentication check for billing system
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const loggedInUser = localStorage.getItem("loggedInUser");
        
        if (!loggedInUser) {
            this.redirectToLogin();
            return false;
        }

        // Verify user exists and is premium
        this.verifyUser(loggedInUser)
            .then(user => {
                if (user && user.isPremium) {
                    this.currentUser = user;
                    this.updateUserDisplay();
                    this.showToast("স্বাগতম! বিলিং সিস্টেমে প্রবেশ করেছেন।", "success");
                } else {
                    this.redirectToLogin();
                }
            })
            .catch(() => {
                this.redirectToLogin();
            });

        return true;
    }

    async verifyUser(username) {
        try {
            const response = await fetch(`../users/${username}.json`);
            if (!response.ok) {
                throw new Error('User not found');
            }
            const userData = await response.json();
            userData.username = username;
            return userData;
        } catch (error) {
            console.error('Error verifying user:', error);
            return null;
        }
    }

    updateUserDisplay() {
        const userDisplay = document.getElementById('currentUser');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = `ব্যবহারকারী: ${this.currentUser.name || this.currentUser.username}`;
        }
    }

    logout() {
        localStorage.removeItem("loggedInUser");
        this.showToast("সফলভাবে লগআউট হয়েছেন।", "info");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1000);
    }

    redirectToLogin() {
        this.showToast("অনুগ্রহ করে প্রথমে লগইন করুন।", "error");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    }

    setupEventListeners() {
        // Setup logout button
        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        });

        // Check authentication on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAuthentication();
            }
        });
    }

    showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        // Set toast content and type
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;

        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Export for use in other scripts
window.authManager = authManager;
window.logout = () => authManager.logout();

