// Project Service - handles project management operations
import storageService from './storageService';
import fmeaService from './fmeaService';

class ProjectService {
  constructor() {
    this.storageService = storageService;
    this.fmeaService = fmeaService;
  }

  // Create a new project
  createProject(projectData = {}) {
    try {
      const project = this.storageService.createProject({
        name: projectData.name || 'New Project',
        description: projectData.description || '',
        system: projectData.system || null,
        fmeaItems: projectData.fmeaItems || [],
        settings: {
          autoSave: true,
          autoSaveInterval: 30000,
          theme: 'light',
          notifications: true,
          ...projectData.settings
        }
      });

      if (project) {
        // Clear current FMEA items and load project data
        this.loadProjectData(project);
        return project;
      }
      return null;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  // Load an existing project
  loadProject(projectId) {
    try {
      const project = this.storageService.loadProject(projectId);
      if (project) {
        this.storageService.setCurrentProject(projectId);
        this.loadProjectData(project);
        return project;
      }
      return null;
    } catch (error) {
      console.error('Error loading project:', error);
      throw new Error('Failed to load project');
    }
  }

  // Load project data into services
  loadProjectData(project) {
    try {
      // Load FMEA items into fmeaService
      if (project.fmeaItems && project.fmeaItems.length > 0) {
        this.fmeaService.fmeaItems = [...project.fmeaItems];
      } else {
        this.fmeaService.fmeaItems = [];
      }

      // Save system data if exists
      if (project.system) {
        this.storageService.saveSystemData(project.system);
      }

      return true;
    } catch (error) {
      console.error('Error loading project data:', error);
      return false;
    }
  }

  // Save current project
  saveCurrentProject() {
    try {
      const currentProject = this.storageService.getCurrentProject();
      if (!currentProject) {
        throw new Error('No current project to save');
      }

      // Update project with current data
      const updatedProject = {
        ...currentProject,
        system: this.storageService.getSystemData(),
        fmeaItems: this.fmeaService.getAllFMEAItems(),
        updatedAt: new Date().toISOString()
      };

      return this.storageService.saveProject(updatedProject);
    } catch (error) {
      console.error('Error saving current project:', error);
      throw new Error('Failed to save project');
    }
  }

  // Get current project
  getCurrentProject() {
    return this.storageService.getCurrentProject();
  }

  // Get all projects
  getAllProjects() {
    return this.storageService.getAllProjects();
  }

  // Delete a project
  deleteProject(projectId) {
    try {
      return this.storageService.deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  // Duplicate a project
  duplicateProject(projectId, newName = null) {
    try {
      const originalProject = this.storageService.loadProject(projectId);
      if (!originalProject) {
        throw new Error('Project not found');
      }

      const duplicatedProject = {
        ...originalProject,
        name: newName || `${originalProject.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return this.createProject(duplicatedProject);
    } catch (error) {
      console.error('Error duplicating project:', error);
      throw new Error('Failed to duplicate project');
    }
  }

  // Export project
  exportProject(projectId = null) {
    try {
      const project = projectId ? 
        this.storageService.loadProject(projectId) : 
        this.storageService.getCurrentProject();

      if (!project) {
        throw new Error('No project to export');
      }

      const exportData = {
        ...project,
        system: project.system || this.storageService.getSystemData(),
        fmeaItems: project.fmeaItems || this.fmeaService.getAllFMEAItems(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting project:', error);
      throw new Error('Failed to export project');
    }
  }

  // Import project
  importProject(jsonData, options = {}) {
    try {
      const projectData = JSON.parse(jsonData);
      
      // Validate project data
      if (!projectData.name) {
        throw new Error('Invalid project data: missing name');
      }

      // Create new project with imported data
      const importedProject = this.createProject({
        name: options.newName || `${projectData.name} (Imported)`,
        description: projectData.description || '',
        system: projectData.system,
        fmeaItems: projectData.fmeaItems || [],
        settings: projectData.settings
      });

      return importedProject;
    } catch (error) {
      console.error('Error importing project:', error);
      throw new Error('Failed to import project: ' + error.message);
    }
  }

  // Get project statistics
  getProjectStatistics(projectId = null) {
    try {
      const project = projectId ? 
        this.storageService.loadProject(projectId) : 
        this.storageService.getCurrentProject();

      if (!project) {
        return null;
      }

      const fmeaItems = project.fmeaItems || [];
      const system = project.system;

      return {
        projectInfo: {
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        },
        systemInfo: system ? {
          name: system.name,
          category: system.category,
          componentCount: system.components?.length || 0
        } : null,
        fmeaStats: {
          totalItems: fmeaItems.length,
          highRiskItems: fmeaItems.filter(item => item.rpn >= 200).length,
          mediumRiskItems: fmeaItems.filter(item => item.rpn >= 100 && item.rpn < 200).length,
          lowRiskItems: fmeaItems.filter(item => item.rpn < 100).length,
          averageRPN: fmeaItems.length > 0 ? 
            Math.round(fmeaItems.reduce((sum, item) => sum + item.rpn, 0) / fmeaItems.length) : 0,
          maxRPN: fmeaItems.length > 0 ? Math.max(...fmeaItems.map(item => item.rpn)) : 0
        }
      };
    } catch (error) {
      console.error('Error getting project statistics:', error);
      return null;
    }
  }

  // Get recent projects
  getRecentProjects() {
    return this.storageService.getRecentProjects();
  }

  // Search projects
  searchProjects(query) {
    try {
      const allProjects = this.getAllProjects();
      const searchTerm = query.toLowerCase();
      
      return allProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  // Update project metadata
  updateProjectMetadata(projectId, updates) {
    try {
      const project = this.storageService.loadProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return this.storageService.saveProject(updatedProject);
    } catch (error) {
      console.error('Error updating project metadata:', error);
      throw new Error('Failed to update project');
    }
  }

  // Auto-save current project
  autoSaveCurrentProject() {
    try {
      const currentProject = this.getCurrentProject();
      if (currentProject) {
        return this.saveCurrentProject();
      }
      return false;
    } catch (error) {
      console.error('Error auto-saving project:', error);
      return false;
    }
  }

  // Initialize auto-save for projects
  initializeProjectAutoSave() {
    const preferences = this.storageService.loadPreferences();
    if (preferences.autoSave) {
      this.storageService.startAutoSave(() => {
        this.autoSaveCurrentProject();
      });
    }
  }

  // Get storage statistics
  getStorageStatistics() {
    return this.storageService.getStorageStats();
  }

  // Clear all projects (with confirmation)
  clearAllProjects() {
    try {
      const projects = this.getAllProjects();
      projects.forEach(project => {
        this.storageService.deleteProject(project.id);
      });
      
      // Clear current project
      this.storageService.setCurrentProject(null);
      
      // Clear FMEA items
      this.fmeaService.clearAllItems();
      
      return true;
    } catch (error) {
      console.error('Error clearing all projects:', error);
      throw new Error('Failed to clear all projects');
    }
  }
}

// Create and export singleton instance
const projectService = new ProjectService();
export default projectService;