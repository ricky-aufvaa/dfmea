import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as FolderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  MoreVert as MoreIcon,
  Assessment as StatsIcon,
  Schedule as RecentIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import projectService from '../../services/projectService';
import storageService from '../../services/storageService';

const ProjectManager = ({ onProjectSelected, currentProject }) => {
  const [projects, setProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Form states
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [importData, setImportData] = useState('');
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    loadProjects();
    loadRecentProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const allProjects = projectService.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      setError('Failed to load projects');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentProjects = () => {
    try {
      const recent = projectService.getRecentProjects();
      setRecentProjects(recent);
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      const newProject = projectService.createProject(projectForm);
      
      if (newProject) {
        setSuccess('Project created successfully');
        setCreateDialogOpen(false);
        setProjectForm({ name: '', description: '' });
        loadProjects();
        loadRecentProjects();
        
        if (onProjectSelected) {
          onProjectSelected(newProject);
        }
      }
    } catch (error) {
      setError('Failed to create project');
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleLoadProject = async (projectId) => {
    try {
      setLoading(true);
      const project = projectService.loadProject(projectId);
      
      if (project) {
        setSuccess('Project loaded successfully');
        loadRecentProjects();
        
        if (onProjectSelected) {
          onProjectSelected(project);
        }
      }
    } catch (error) {
      setError('Failed to load project');
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const success = projectService.deleteProject(projectId);
      
      if (success) {
        setSuccess('Project deleted successfully');
        loadProjects();
        loadRecentProjects();
        
        // If deleted project was current, clear selection
        if (currentProject && currentProject.id === projectId) {
          if (onProjectSelected) {
            onProjectSelected(null);
          }
        }
      }
    } catch (error) {
      setError('Failed to delete project');
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleEditProject = async () => {
    if (!projectForm.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      const success = projectService.updateProjectMetadata(editingProject.id, {
        name: projectForm.name,
        description: projectForm.description
      });
      
      if (success) {
        setSuccess('Project updated successfully');
        setEditDialogOpen(false);
        setEditingProject(null);
        setProjectForm({ name: '', description: '' });
        loadProjects();
        loadRecentProjects();
      }
    } catch (error) {
      setError('Failed to update project');
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleDuplicateProject = async (projectId) => {
    try {
      setLoading(true);
      const duplicatedProject = projectService.duplicateProject(projectId);
      
      if (duplicatedProject) {
        setSuccess('Project duplicated successfully');
        loadProjects();
        loadRecentProjects();
      }
    } catch (error) {
      setError('Failed to duplicate project');
      console.error('Error duplicating project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleExportProject = async (projectId) => {
    try {
      const exportData = projectService.exportProject(projectId);
      const project = projects.find(p => p.id === projectId);
      
      const dataBlob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project?.name || 'project'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Project exported successfully');
    } catch (error) {
      setError('Failed to export project');
      console.error('Error exporting project:', error);
    } finally {
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleImportProject = async () => {
    if (!importData.trim()) {
      setError('Please paste project data');
      return;
    }

    try {
      setLoading(true);
      const importedProject = projectService.importProject(importData);
      
      if (importedProject) {
        setSuccess('Project imported successfully');
        setImportDialogOpen(false);
        setImportData('');
        loadProjects();
        loadRecentProjects();
        
        if (onProjectSelected) {
          onProjectSelected(importedProject);
        }
      }
    } catch (error) {
      setError('Failed to import project: ' + error.message);
      console.error('Error importing project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleShowStats = async (projectId) => {
    try {
      const stats = projectService.getProjectStatistics(projectId);
      setProjectStats(stats);
      setStatsDialogOpen(true);
    } catch (error) {
      setError('Failed to load project statistics');
      console.error('Error loading stats:', error);
    }
  };

  const handleMenuOpen = (event, projectId) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectId(null);
  };

  const openEditDialog = (project) => {
    setEditingProject(project);
    setProjectForm({ name: project.name, description: project.description || '' });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectStatusColor = (project) => {
    const daysSinceUpdate = (new Date() - new Date(project.updatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) return 'success';
    if (daysSinceUpdate < 7) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Project
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {currentProject && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Current Project: <strong>{currentProject.name}</strong>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RecentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Recent Projects</Typography>
                </Box>
                <List dense>
                  {recentProjects.slice(0, 5).map((project) => (
                    <ListItem
                      key={project.id}
                      button
                      onClick={() => handleLoadProject(project.id)}
                    >
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={project.name}
                        secondary={`Updated: ${formatDate(project.updatedAt)}`}
                      />
                      <Chip
                        size="small"
                        color={getProjectStatusColor(project)}
                        label="Recent"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* All Projects */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            All Projects ({projects.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No projects yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first project to start managing FMEA analyses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: currentProject?.id === project.id ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {project.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, project.id)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                      
                      {project.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {project.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        <Chip
                          size="small"
                          label={`${project.fmeaItems?.length || 0} FMEA items`}
                          color="primary"
                        />
                        {project.system && (
                          <Chip
                            size="small"
                            label={project.system.name}
                            color="secondary"
                          />
                        )}
                        <Chip
                          size="small"
                          color={getProjectStatusColor(project)}
                          label={formatDate(project.updatedAt)}
                        />
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handleLoadProject(project.id)}
                        disabled={currentProject?.id === project.id}
                      >
                        {currentProject?.id === project.id ? 'Current' : 'Load'}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleShowStats(project.id)}
                      >
                        Stats
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const project = projects.find(p => p.id === selectedProjectId);
          openEditDialog(project);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDuplicateProject(selectedProjectId);
          handleMenuClose();
        }}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportProject(selectedProjectId);
          handleMenuClose();
        }}>
          <ExportIcon sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteProject(selectedProjectId);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={projectForm.name}
            onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={projectForm.description}
            onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={projectForm.name}
            onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={projectForm.description}
            onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Project Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Paste the exported project JSON data below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            placeholder="Paste project JSON data here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleImportProject} variant="contained" disabled={loading || !importData.trim()}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Statistics Dialog */}
      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Project Statistics</DialogTitle>
        <DialogContent>
          {projectStats && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{projectStats.projectInfo.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectStats.projectInfo.description}
                </Typography>
                <Typography variant="caption" display="block">
                  Created: {formatDate(projectStats.projectInfo.createdAt)}
                </Typography>
                <Typography variant="caption" display="block">
                  Updated: {formatDate(projectStats.projectInfo.updatedAt)}
                </Typography>
              </Grid>
              
              {projectStats.systemInfo && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>System Information</Typography>
                      <Typography><strong>Name:</strong> {projectStats.systemInfo.name}</Typography>
                      <Typography><strong>Category:</strong> {projectStats.systemInfo.category}</Typography>
                      <Typography><strong>Components:</strong> {projectStats.systemInfo.componentCount}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>FMEA Statistics</Typography>
                    <Typography><strong>Total Items:</strong> {projectStats.fmeaStats.totalItems}</Typography>
                    <Typography><strong>High Risk:</strong> {projectStats.fmeaStats.highRiskItems}</Typography>
                    <Typography><strong>Medium Risk:</strong> {projectStats.fmeaStats.mediumRiskItems}</Typography>
                    <Typography><strong>Low Risk:</strong> {projectStats.fmeaStats.lowRiskItems}</Typography>
                    <Typography><strong>Average RPN:</strong> {projectStats.fmeaStats.averageRPN}</Typography>
                    <Typography><strong>Max RPN:</strong> {projectStats.fmeaStats.maxRPN}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
