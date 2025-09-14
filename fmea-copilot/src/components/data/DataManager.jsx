import React, { useState } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  CloudDownload as BackupIcon,
  CloudUpload as RestoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import projectService from '../../services/projectService';
import storageService from '../../services/storageService';
import fmeaService from '../../services/fmeaService';

const DataManager = ({ currentProject }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState('project'); // 'project' or 'fmea'
  const [importData, setImportData] = useState('');
  const [storageStats, setStorageStats] = useState(null);

  React.useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = () => {
    try {
      const stats = storageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleExportProject = async () => {
    if (!currentProject) {
      setError('No project selected to export');
      return;
    }

    try {
      setLoading(true);
      const exportData = projectService.exportProject(currentProject.id);
      
      const dataBlob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Project exported successfully');
    } catch (error) {
      setError('Failed to export project: ' + error.message);
      console.error('Error exporting project:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleExportFMEAData = async () => {
    try {
      setLoading(true);
      const exportData = fmeaService.exportFMEAItems();
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fmea-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('FMEA data exported successfully');
    } catch (error) {
      setError('Failed to export FMEA data: ' + error.message);
      console.error('Error exporting FMEA data:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleExportAllData = async () => {
    try {
      setLoading(true);
      const exportData = storageService.exportAllData();
      
      if (!exportData) {
        throw new Error('Failed to export data');
      }
      
      const dataBlob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fmea-copilot-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Complete backup exported successfully');
    } catch (error) {
      setError('Failed to export backup: ' + error.message);
      console.error('Error exporting all data:', error);
    } finally {
      setLoading(false);
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
        loadStorageStats();
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

  const handleImportFMEAData = async () => {
    if (!importData.trim()) {
      setError('Please paste FMEA data');
      return;
    }

    try {
      setLoading(true);
      const data = JSON.parse(importData);
      const items = data.items || data; // Handle both formats
      
      const result = fmeaService.importFMEAItems(items);
      
      if (result.success) {
        setSuccess(`Imported ${result.imported} FMEA items${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}`);
        setImportDialogOpen(false);
        setImportData('');
        loadStorageStats();
      } else {
        setError('Failed to import FMEA data: ' + result.error);
      }
    } catch (error) {
      setError('Failed to import FMEA data: Invalid format');
      console.error('Error importing FMEA data:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear ALL data? This will delete all projects, FMEA items, and settings. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const success = storageService.clearAllData();
      
      if (success) {
        setSuccess('All data cleared successfully');
        loadStorageStats();
      } else {
        setError('Failed to clear data');
      }
    } catch (error) {
      setError('Failed to clear data: ' + error.message);
      console.error('Error clearing data:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const openImportDialog = (type) => {
    setImportType(type);
    setImportData('');
    setImportDialogOpen(true);
  };

  const handleImport = () => {
    if (importType === 'project') {
      handleImportProject();
    } else {
      handleImportFMEAData();
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Management
      </Typography>

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

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExportIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Export Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Export your data for backup or sharing purposes
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ReportIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Current Project"
                    secondary={currentProject ? `Export "${currentProject.name}" with all data` : 'No project selected'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ReportIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="FMEA Data Only"
                    secondary="Export only FMEA analysis items"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BackupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Complete Backup"
                    secondary="Export all projects, settings, and data"
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<ExportIcon />}
                onClick={handleExportProject}
                disabled={!currentProject || loading}
                size="small"
              >
                Export Project
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportFMEAData}
                disabled={loading}
                size="small"
              >
                Export FMEA
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportAllData}
                disabled={loading}
                size="small"
              >
                Full Backup
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImportIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Import Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Import data from exported files or other sources
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <RestoreIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Import Project"
                    secondary="Import a complete project with system and FMEA data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <RestoreIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Import FMEA Data"
                    secondary="Import FMEA items into current project"
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<ImportIcon />}
                onClick={() => openImportDialog('project')}
                disabled={loading}
                size="small"
              >
                Import Project
              </Button>
              <Button
                variant="outlined"
                onClick={() => openImportDialog('fmea')}
                disabled={loading}
                size="small"
              >
                Import FMEA
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Storage Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Storage Information</Typography>
              </Box>
              
              {storageStats ? (
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Projects"
                      secondary={`${storageStats.projectCount} projects stored`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Current Project"
                      secondary={storageStats.currentProject}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Storage Size"
                      secondary={storageStats.totalSizeFormatted}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Auto-save"
                      secondary={
                        <Chip
                          size="small"
                          label={storageStats.autoSaveEnabled ? 'Enabled' : 'Disabled'}
                          color={storageStats.autoSaveEnabled ? 'success' : 'default'}
                        />
                      }
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading storage information...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeleteIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Data Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage your stored data and settings
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> Clearing data will permanently delete all projects, FMEA items, and settings.
                </Typography>
              </Alert>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAllData}
                disabled={loading}
                size="small"
              >
                Clear All Data
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Usage Tips */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Usage Tips</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Regular Backups
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export your complete backup regularly to prevent data loss. The backup includes all projects and settings.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Project Sharing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export individual projects to share with team members or import projects from colleagues.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Migration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use FMEA data export/import to migrate analysis data between different projects or systems.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Import {importType === 'project' ? 'Project' : 'FMEA Data'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Paste the exported {importType === 'project' ? 'project' : 'FMEA'} JSON data below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            placeholder={`Paste ${importType === 'project' ? 'project' : 'FMEA'} JSON data here...`}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={loading || !importData.trim()}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DataManager;