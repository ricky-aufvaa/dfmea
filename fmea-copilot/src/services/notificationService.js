// Notification Service - handles global notifications and loading states
class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.loadingStates = new Map();
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => callback({
      notifications: [...this.notifications],
      loadingStates: new Map(this.loadingStates)
    }));
  }

  // Add notification
  addNotification(notification) {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      autoHide: true,
      duration: 5000,
      ...notification
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-remove notification
    if (newNotification.autoHide) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  // Remove notification
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
    this.notify();
  }

  // Show success notification
  showSuccess(message, options = {}) {
    return this.addNotification({
      type: 'success',
      message,
      ...options
    });
  }

  // Show error notification
  showError(message, options = {}) {
    return this.addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }

  // Show warning notification
  showWarning(message, options = {}) {
    return this.addNotification({
      type: 'warning',
      message,
      ...options
    });
  }

  // Show info notification
  showInfo(message, options = {}) {
    return this.addNotification({
      type: 'info',
      message,
      ...options
    });
  }

  // Set loading state
  setLoading(key, isLoading, message = '') {
    if (isLoading) {
      this.loadingStates.set(key, { isLoading: true, message });
    } else {
      this.loadingStates.delete(key);
    }
    this.notify();
  }

  // Check if any loading state is active
  isAnyLoading() {
    return this.loadingStates.size > 0;
  }

  // Get loading state for specific key
  getLoadingState(key) {
    return this.loadingStates.get(key) || { isLoading: false, message: '' };
  }

  // Get all loading states
  getAllLoadingStates() {
    return Array.from(this.loadingStates.entries()).map(([key, state]) => ({
      key,
      ...state
    }));
  }

  // Handle async operations with loading states
  async withLoading(key, asyncOperation, loadingMessage = 'Loading...') {
    try {
      this.setLoading(key, true, loadingMessage);
      const result = await asyncOperation();
      return result;
    } catch (error) {
      this.showError(`Error: ${error.message}`);
      throw error;
    } finally {
      this.setLoading(key, false);
    }
  }

  // Handle async operations with notifications
  async withNotifications(asyncOperation, options = {}) {
    const {
      loadingKey = 'operation',
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed'
    } = options;

    try {
      this.setLoading(loadingKey, true, loadingMessage);
      const result = await asyncOperation();
      
      if (successMessage) {
        this.showSuccess(successMessage);
      }
      
      return result;
    } catch (error) {
      const message = error.message || errorMessage;
      this.showError(message);
      throw error;
    } finally {
      this.setLoading(loadingKey, false);
    }
  }

  // Log error with notification
  logError(error, context = '') {
    const errorMessage = `${context ? context + ': ' : ''}${error.message || 'Unknown error'}`;
    
    console.error('NotificationService Error:', {
      message: errorMessage,
      error,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });

    this.showError(errorMessage);

    // Store error in localStorage for debugging
    try {
      const errorLog = {
        message: errorMessage,
        context,
        timestamp: new Date().toISOString(),
        stack: error.stack,
        userAgent: navigator.userAgent
      };

      const existingLogs = JSON.parse(localStorage.getItem('fmea_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      const recentLogs = existingLogs.slice(-50);
      localStorage.setItem('fmea_error_logs', JSON.stringify(recentLogs));
    } catch (logError) {
      console.error('Failed to log error to localStorage:', logError);
    }
  }

  // Get error logs
  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('fmea_error_logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve error logs:', error);
      return [];
    }
  }

  // Clear error logs
  clearErrorLogs() {
    try {
      localStorage.removeItem('fmea_error_logs');
      this.showInfo('Error logs cleared');
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  // Validate storage availability
  validateStorage() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      this.showError('Local storage is not available. Data persistence may not work properly.');
      return false;
    }
  }

  // Handle network errors
  handleNetworkError(error) {
    if (!navigator.onLine) {
      this.showWarning('You are currently offline. Some features may not work properly.');
    } else {
      this.showError('Network error occurred. Please check your connection.');
    }
    this.logError(error, 'Network');
  }

  // Handle storage quota errors
  handleStorageQuotaError(error) {
    this.showError('Storage quota exceeded. Please clear some data or export your projects.');
    this.logError(error, 'Storage Quota');
  }

  // Handle validation errors
  handleValidationError(error, field = '') {
    const message = field ? `Validation error in ${field}: ${error.message}` : `Validation error: ${error.message}`;
    this.showWarning(message);
  }

  // Show confirmation dialog (returns Promise)
  showConfirmation(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      resolve(confirmed);
    });
  }

  // Batch operations with progress
  async batchOperation(items, operation, options = {}) {
    const {
      batchSize = 10,
      progressKey = 'batch_operation',
      successMessage = 'Batch operation completed',
      errorMessage = 'Batch operation failed'
    } = options;

    const results = [];
    const errors = [];
    let processed = 0;

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const progress = Math.round((processed / items.length) * 100);
        
        this.setLoading(progressKey, true, `Processing... ${progress}%`);

        for (const item of batch) {
          try {
            const result = await operation(item);
            results.push(result);
          } catch (error) {
            errors.push({ item, error });
          }
          processed++;
        }
      }

      if (errors.length === 0) {
        this.showSuccess(successMessage);
      } else if (errors.length < items.length) {
        this.showWarning(`${successMessage} with ${errors.length} errors`);
      } else {
        this.showError(errorMessage);
      }

      return { results, errors };
    } finally {
      this.setLoading(progressKey, false);
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;