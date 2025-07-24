/* ===================================
   Zovatu Smart Billing Tool - Users Data
   User Management Data Module
   =================================== */

// User management class
class UserManager {
    constructor() {
        this.init();
    }

    // Initialize user manager
    init() {
        // Any initialization logic
    }

    // Get all users
    getAllUsers() {
        return ZovatuStore.getUsers();
    }

    // Get active users
    getActiveUsers() {
        return ZovatuStore.getUsers().filter(user => user.isActive);
    }

    // Create new user
    createUser(userData) {
        const user = {
            username: userData.username,
            password: userData.password, // In production, this should be hashed
            role: userData.role || 'salesman',
            name: userData.name,
            email: userData.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar || '',
            permissions: this.getDefaultPermissions(userData.role),
            shopAccess: userData.shopAccess || [], // Array of shop IDs user can access
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            loginCount: 0
        };

        const success = ZovatuStore.addUser(user);
        if (success) {
            ZovatuUtils.showToast('User created successfully!', 'success');
            return user;
        } else {
            ZovatuUtils.showToast('Failed to create user', 'error');
            return null;
        }
    }

    // Update user
    updateUser(userId, updates) {
        const success = ZovatuStore.updateUser(userId, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            ZovatuUtils.showToast('User updated successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to update user', 'error');
            return false;
        }
    }

    // Delete user
    deleteUser(userId) {
        // Prevent deleting the last admin user
        const users = this.getAllUsers();
        const adminUsers = users.filter(user => user.role === 'admin' && user.isActive);
        const userToDelete = users.find(user => user.id === userId);

        if (userToDelete && userToDelete.role === 'admin' && adminUsers.length === 1) {
            ZovatuUtils.showToast('Cannot delete the last admin user', 'error');
            return false;
        }

        const success = ZovatuStore.deleteUser(userId);
        if (success) {
            ZovatuUtils.showToast('User deleted successfully!', 'success');
            return true;
        } else {
            ZovatuUtils.showToast('Failed to delete user', 'error');
            return false;
        }
    }

    // Get user by ID
    getUser(userId) {
        return ZovatuStore.getUser(userId);
    }

    // Get user by username
    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(user => user.username === username) || null;
    }

    // Authenticate user
    authenticateUser(username, password) {
        const user = ZovatuStore.authenticateUser(username, password);
        if (user) {
            // Update login statistics
            this.updateUser(user.id, {
                lastLogin: new Date().toISOString(),
                loginCount: (user.loginCount || 0) + 1
            });
        }
        return user;
    }

    // Change password
    changePassword(userId, currentPassword, newPassword) {
        const user = this.getUser(userId);
        if (!user) {
            ZovatuUtils.showToast('User not found', 'error');
            return false;
        }

        if (user.password !== currentPassword) {
            ZovatuUtils.showToast('Current password is incorrect', 'error');
            return false;
        }

        const success = this.updateUser(userId, { password: newPassword });
        if (success) {
            ZovatuUtils.showToast('Password changed successfully!', 'success');
        }
        return success;
    }

    // Reset password (admin only)
    resetPassword(userId, newPassword) {
        const currentUser = ZovatuAuth.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            ZovatuUtils.showToast('Only administrators can reset passwords', 'error');
            return false;
        }

        const success = this.updateUser(userId, { password: newPassword });
        if (success) {
            ZovatuUtils.showToast('Password reset successfully!', 'success');
        }
        return success;
    }

    // Get user roles
    getUserRoles() {
        return [
            {
                value: 'admin',
                label: 'Administrator',
                description: 'Full access to all features and settings',
                icon: 'fas fa-user-shield'
            },
            {
                value: 'manager',
                label: 'Manager',
                description: 'Access to shop management and reports',
                icon: 'fas fa-user-tie'
            },
            {
                value: 'salesman',
                label: 'Salesman',
                description: 'Access to billing and basic features',
                icon: 'fas fa-user'
            },
            {
                value: 'cashier',
                label: 'Cashier',
                description: 'Limited access to billing only',
                icon: 'fas fa-cash-register'
            }
        ];
    }

    // Get default permissions for role
    getDefaultPermissions(role) {
        const permissions = {
            admin: {
                // Full access
                canViewDashboard: true,
                canManageShops: true,
                canManageProducts: true,
                canManageUsers: true,
                canViewReports: true,
                canManageSettings: true,
                canExportData: true,
                canImportData: true,
                canDeleteData: true,
                canViewAllShops: true,
                canCreateInvoices: true,
                canEditInvoices: true,
                canDeleteInvoices: true,
                canPrintInvoices: true,
                canManageInventory: true,
                canViewAnalytics: true
            },
            manager: {
                // Shop management and reports
                canViewDashboard: true,
                canManageShops: true,
                canManageProducts: true,
                canManageUsers: false,
                canViewReports: true,
                canManageSettings: false,
                canExportData: true,
                canImportData: true,
                canDeleteData: false,
                canViewAllShops: true,
                canCreateInvoices: true,
                canEditInvoices: true,
                canDeleteInvoices: false,
                canPrintInvoices: true,
                canManageInventory: true,
                canViewAnalytics: true
            },
            salesman: {
                // Basic billing features
                canViewDashboard: true,
                canManageShops: false,
                canManageProducts: false,
                canManageUsers: false,
                canViewReports: false,
                canManageSettings: false,
                canExportData: false,
                canImportData: false,
                canDeleteData: false,
                canViewAllShops: false,
                canCreateInvoices: true,
                canEditInvoices: false,
                canDeleteInvoices: false,
                canPrintInvoices: true,
                canManageInventory: false,
                canViewAnalytics: false
            },
            cashier: {
                // Limited billing only
                canViewDashboard: false,
                canManageShops: false,
                canManageProducts: false,
                canManageUsers: false,
                canViewReports: false,
                canManageSettings: false,
                canExportData: false,
                canImportData: false,
                canDeleteData: false,
                canViewAllShops: false,
                canCreateInvoices: true,
                canEditInvoices: false,
                canDeleteInvoices: false,
                canPrintInvoices: true,
                canManageInventory: false,
                canViewAnalytics: false
            }
        };

        return permissions[role] || permissions.salesman;
    }

    // Check user permission
    hasPermission(userId, permission) {
        const user = this.getUser(userId);
        if (!user || !user.isActive) return false;

        return user.permissions && user.permissions[permission] === true;
    }

    // Check if user can access shop
    canAccessShop(userId, shopId) {
        const user = this.getUser(userId);
        if (!user || !user.isActive) return false;

        // Admin can access all shops
        if (user.role === 'admin') return true;

        // Check if user has specific shop access
        return user.shopAccess && user.shopAccess.includes(shopId);
    }

    // Grant shop access to user
    grantShopAccess(userId, shopId) {
        const user = this.getUser(userId);
        if (!user) return false;

        const shopAccess = user.shopAccess || [];
        if (!shopAccess.includes(shopId)) {
            shopAccess.push(shopId);
            return this.updateUser(userId, { shopAccess });
        }
        return true;
    }

    // Revoke shop access from user
    revokeShopAccess(userId, shopId) {
        const user = this.getUser(userId);
        if (!user) return false;

        const shopAccess = user.shopAccess || [];
        const updatedAccess = shopAccess.filter(id => id !== shopId);
        return this.updateUser(userId, { shopAccess: updatedAccess });
    }

    // Get user statistics
    getUserStats(userId) {
        const user = this.getUser(userId);
        if (!user) return null;

        const invoices = ZovatuStore.getInvoices();
        const userInvoices = invoices.filter(invoice => 
            invoice.createdBy === userId || invoice.userId === userId
        );

        const totalSales = userInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const totalOrders = userInvoices.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate performance for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentInvoices = userInvoices.filter(invoice => 
            new Date(invoice.createdAt) >= thirtyDaysAgo
        );

        const recentSales = recentInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const recentOrders = recentInvoices.length;

        return {
            totalSales,
            totalOrders,
            averageOrderValue,
            recentSales,
            recentOrders,
            loginCount: user.loginCount || 0,
            lastLogin: user.lastLogin,
            accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        };
    }

    // Get user performance ranking
    getUserPerformanceRanking() {
        const users = this.getActiveUsers().filter(user => 
            user.role === 'salesman' || user.role === 'cashier'
        );

        const userPerformance = users.map(user => {
            const stats = this.getUserStats(user.id);
            return {
                user,
                stats,
                score: stats.recentSales // Use recent sales as performance score
            };
        }).sort((a, b) => b.score - a.score);

        return userPerformance;
    }

    // Validate user data
    validateUserData(userData) {
        const errors = [];

        if (!userData.username || userData.username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!userData.password || userData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (userData.email && !ZovatuUtils.validateEmail(userData.email)) {
            errors.push('Invalid email address');
        }

        if (userData.phone && !ZovatuUtils.validatePhone(userData.phone)) {
            errors.push('Invalid phone number');
        }

        // Check for duplicate username
        const existingUsers = this.getAllUsers();
        const duplicateUsername = existingUsers.find(user => 
            user.username.toLowerCase() === userData.username.toLowerCase() &&
            user.id !== userData.id
        );

        if (duplicateUsername) {
            errors.push('Username already exists');
        }

        return errors;
    }

    // Export users
    exportUsers(format = 'json') {
        const users = this.getAllUsers();
        
        // Remove sensitive data
        const exportUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount
        }));

        if (format === 'csv') {
            return this.exportUsersCSV(exportUsers);
        } else {
            return this.exportUsersJSON(exportUsers);
        }
    }

    // Export users as JSON
    exportUsersJSON(users) {
        const exportData = {
            users,
            exportDate: new Date().toISOString(),
            totalUsers: users.length
        };

        const filename = `users_export_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        const jsonString = ZovatuUtils.stringifyJSON(exportData);
        
        ZovatuUtils.downloadFile(jsonString, filename, 'application/json');
        return true;
    }

    // Export users as CSV
    exportUsersCSV(users) {
        const headers = [
            'Username', 'Name', 'Role', 'Email', 'Phone', 
            'Status', 'Created Date', 'Last Login', 'Login Count'
        ];

        const csvData = [
            headers.join(','),
            ...users.map(user => [
                `"${user.username}"`,
                `"${user.name}"`,
                `"${user.role}"`,
                `"${user.email}"`,
                `"${user.phone}"`,
                user.isActive ? 'Active' : 'Inactive',
                `"${ZovatuUtils.formatDate(user.createdAt)}"`,
                user.lastLogin ? `"${ZovatuUtils.formatDate(user.lastLogin)}"` : 'Never',
                user.loginCount || 0
            ].join(','))
        ].join('\n');

        const filename = `users_export_${ZovatuUtils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`;
        
        ZovatuUtils.downloadFile(csvData, filename, 'text/csv');
        return true;
    }

    // Import users
    importUsers(file, callback) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'json') {
            this.importUsersJSON(file, callback);
        } else if (fileExtension === 'csv') {
            this.importUsersCSV(file, callback);
        } else {
            callback(false, 'Unsupported file format. Please use JSON or CSV.');
        }
    }

    // Import users from JSON
    importUsersJSON(file, callback) {
        ZovatuUtils.uploadFile(file, (data, file) => {
            try {
                const importData = JSON.parse(data);
                const users = importData.users || importData;
                
                if (!Array.isArray(users)) {
                    callback(false, 'Invalid file format');
                    return;
                }

                let imported = 0;
                let errors = 0;

                users.forEach(userData => {
                    const validationErrors = this.validateUserData(userData);
                    
                    if (validationErrors.length === 0) {
                        const success = ZovatuStore.addUser({
                            ...userData,
                            id: ZovatuUtils.generateId('user_'),
                            password: userData.password || 'password123', // Default password
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        
                        if (success) {
                            imported++;
                        } else {
                            errors++;
                        }
                    } else {
                        errors++;
                    }
                });

                callback(true, `Imported ${imported} users successfully. ${errors} errors.`);
            } catch (error) {
                callback(false, 'Invalid JSON file format');
            }
        });
    }

    // Import users from CSV
    importUsersCSV(file, callback) {
        ZovatuUtils.uploadFile(file, (data, file) => {
            try {
                const lines = data.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                
                let imported = 0;
                let errors = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                    
                    const userData = {
                        username: values[0] || '',
                        name: values[1] || '',
                        role: values[2] || 'salesman',
                        email: values[3] || '',
                        phone: values[4] || '',
                        password: 'password123', // Default password
                        isActive: values[5] !== 'Inactive'
                    };

                    const validationErrors = this.validateUserData(userData);
                    
                    if (validationErrors.length === 0) {
                        const success = ZovatuStore.addUser({
                            ...userData,
                            id: ZovatuUtils.generateId('user_'),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        
                        if (success) {
                            imported++;
                        } else {
                            errors++;
                        }
                    } else {
                        errors++;
                    }
                }

                callback(true, `Imported ${imported} users successfully. ${errors} errors.`);
            } catch (error) {
                callback(false, 'Invalid CSV file format');
            }
        });
    }

    // Search users
    searchUsers(query) {
        const users = this.getAllUsers();
        const searchTerm = query.toLowerCase();
        
        return users.filter(user => 
            user.username.toLowerCase().includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );
    }
}

// Create global user manager instance
const ZovatuUsers = new UserManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserManager, ZovatuUsers };
}

