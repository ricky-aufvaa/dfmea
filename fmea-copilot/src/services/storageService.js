// Storage Service - handles data persistence using localStorage
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'fmea_copilot_projects',
  CURRENT_PROJECT: 'fmea_copilot_current_project',
  USER_PREFERENCES: 'fmea_copilot_preferences',
  APP_STATE: 'fmea_copilot_app_state'
};

// Default project structure
const DEFAULT_PROJECT = {
  id: null,
  name: 'Untitled Project',
  description: '',
  createdAt: null,
  updatedAt: null,
  system: null,
  fmeaItems: [],
  settings: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    theme: 'light',
    notifications: true
  }
};

// Default user preferences
const DEFAULT_PREFERENCES = {
  theme: 'light',
  autoSave: true,
  autoSaveInterval: 30000,
  notifications: true,
  defaultRPNThresholds: {
    low: 50,
    medium: 100,
    high: 200,
    critical: 300
  },
  recentProjects: []
};

class StorageService {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
    this.autoSaveTimer = null;
    this.currentProject = null;
    this.preferences = this.loadPreferences();
    
    // Initialize storage if not exists
    this.initializeStorage();
  }

  // Check if localStorage is available
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  // Initialize storage with default values if not exists
  initializeStorage() {
    if (!this.isAvailable) return;

    try {
      // Initialize projects list if not exists
      if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
      }

      // Initialize preferences if not exists
      if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
      }

      // Load current project if exists
      const currentProjectId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
      if (currentProjectId) {
        this.currentProject = this.loadProject(currentProjectId);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // Generic storage operations
  setItem(key, value) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // Project management
  createProject(projectData = {}) {
    const project = {
      ...DEFAULT_PROJECT,
      ...projectData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.saveProject(project)) {
      this.setCurrentProject(project.id);
      this.addToRecentProjects(project);
      return project;
    }
    return null;
  }

  saveProject(project) {
    if (!this.isAvailable || !project.id) return false;

    try {
      const projects = this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      project.updatedAt = new Date().toISOString();
      
      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }

      this.setItem(STORAGE_KEYS.PROJECTS, projects);
      
      // Update current project if it's the active one
      if (this.currentProject && this.currentProject.id === project.id) {
        this.currentProject = project;
      }

      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    }
  }

  loadProject(projectId) {
    if (!this.isAvailable || !projectId) return null;

    try {
      const projects = this.getAllProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        this.addToRecentProjects(project);
        return project;
      }
      return null;
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  deleteProject(projectId) {
    if (!this.isAvailable || !projectId) return false;

    try {
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      this.setItem(STORAGE_KEYS.PROJECTS, filteredProjects);
      
      // Clear current project if it's the deleted one
      if (this.currentProject && this.currentProject.id === projectId) {
        this.currentProject = null;
        this.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
      }

      // Remove from recent projects
      this.removeFromRecentProjects(projectId);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  getAllProjects() {
    return this.getItem(STORAGE_KEYS.PROJECTS, []);
  }

  setCurrentProject(projectId) {
    if (!this.isAvailable) return false;

    try {
      if (projectId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
        this.currentProject = this.loadProject(projectId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
        this.currentProject = null;
      }
      return true;
    } catch (error) {
      console.error('Error setting current project:', error);
      return false;
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }

  // System data operations
  saveSystemData(systemData) {
    if (!this.currentProject) return false;

    this.currentProject.system = systemData;
    return this.saveProject(this.currentProject);
  }

  getSystemData() {
    return this.currentProject?.system || null;
  }

  // FMEA items operations
  saveFMEAItems(fmeaItems) {
    if (!this.currentProject) return false;

    this.currentProject.fmeaItems = fmeaItems;
    return this.saveProject(this.currentProject);
  }

  getFMEAItems() {
    return this.currentProject?.fmeaItems || [];
  }

  addFMEAItem(fmeaItem) {
    if (!this.currentProject) return false;

    if (!this.currentProject.fmeaItems) {
      this.currentProject.fmeaItems = [];
    }
    
    this.currentProject.fmeaItems.push(fmeaItem);
    return this.saveProject(this.currentProject);
  }

  updateFMEAItem(itemId, updates) {
    if (!this.currentProject || !this.currentProject.fmeaItems) return false;

    const itemIndex = this.currentProject.fmeaItems.findIndex(item => item.id === itemId);
    if (itemIndex >= 0) {
      this.currentProject.fmeaItems[itemIndex] = {
        ...this.currentProject.fmeaItems[itemIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return this.saveProject(this.currentProject);
    }
    return false;
  }

  deleteFMEAItem(itemId) {
    if (!this.currentProject || !this.currentProject.fmeaItems) return false;

    this.currentProject.fmeaItems = this.currentProject.fmeaItems.filter(item => item.id !== itemId);
    return this.saveProject(this.currentProject);
  }

  // User preferences
  loadPreferences() {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  }

  savePreferences(preferences) {
    const updatedPreferences = { ...this.preferences, ...preferences };
    this.preferences = updatedPreferences;
    return this.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  }

  getPreference(key, defaultValue = null) {
    return this.preferences[key] || defaultValue;
  }

  setPreference(key, value) {
    this.preferences[key] = value;
    return this.savePreferences({ [key]: value });
  }

  // Recent projects management
  addToRecentProjects(project) {
    const recentProjects = this.getPreference('recentProjects', []);
    const projectInfo = {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt
    };

    // Remove if already exists
    const filteredRecent = recentProjects.filter(p => p.id !== project.id);
    
    // Add to beginning and limit to 10
    const updatedRecent = [projectInfo, ...filteredRecent].slice(0, 10);
    
    this.setPreference('recentProjects', updatedRecent);
  }

  removeFromRecentProjects(projectId) {
    const recentProjects = this.getPreference('recentProjects', []);
    const filteredRecent = recentProjects.filter(p => p.id !== projectId);
    this.setPreference('recentProjects', filteredRecent);
  }

  getRecentProjects() {
    return this.getPreference('recentProjects', []);
  }

  // Data import/export
  exportProject(projectId = null) {
    const project = projectId ? this.loadProject(projectId) : this.currentProject;
    if (!project) return null;

    try {
      const exportData = {
        ...project,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting project:', error);
      return null;
    }
  }

  importProject(jsonData) {
    try {
      const projectData = JSON.parse(jsonData);
      
      // Validate required fields
      if (!projectData.name) {
        throw new Error('Invalid project data: missing name');
      }

      // Create new project with imported data
      const newProject = {
        ...DEFAULT_PROJECT,
        ...projectData,
        id: uuidv4(), // Generate new ID to avoid conflicts
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        importedAt: new Date().toISOString()
      };

      if (this.saveProject(newProject)) {
        return newProject;
      }
      return null;
    } catch (error) {
      console.error('Error importing project:', error);
      throw new Error('Invalid project file format');
    }
  }

  exportAllData() {
    try {
      const allData = {
        projects: this.getAllProjects(),
        preferences: this.preferences,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Error exporting all data:', error);
      return null;
    }
  }

  // Auto-save functionality
  startAutoSave(callback) {
    if (!this.preferences.autoSave) return;

    this.stopAutoSave(); // Clear existing timer
    
    this.autoSaveTimer = setInterval(() => {
      if (this.currentProject && callback) {
        callback();
      }
    }, this.preferences.autoSaveInterval);
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Storage cleanup
  clearAllData() {
    if (!this.isAvailable) return false;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      this.currentProject = null;
      this.preferences = DEFAULT_PREFERENCES;
      this.stopAutoSave();
      
      // Reinitialize
      this.initializeStorage();
      
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Storage statistics
  getStorageStats() {
    if (!this.isAvailable) return null;

    try {
      const projects = this.getAllProjects();
      const totalSize = new Blob([JSON.stringify({
        projects,
        preferences: this.preferences
      })]).size;

      return {
        projectCount: projects.length,
        currentProject: this.currentProject?.name || 'None',
        totalSize: totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        storageAvailable: this.isAvailable,
        autoSaveEnabled: this.preferences.autoSave
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;