import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AutoAwesome as AIIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import fmeaService from '../../services/fmeaService';
import storageService from '../../services/storageService';
import { SEVERITY_LEVELS, OCCURRENCE_LEVELS, DETECTION_LEVELS, RPN_THRESHOLDS } from '../../utils/constants';

const FMEAAnalysis = ({ currentSystem }) => {
  const [fmeaItems, setFmeaItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    component: '',
    function: '',
    failureMode: '',
    effects: '',
    causes: '',
    currentControls: '',
    severity: 1,
    occurrence: 1,
    detection: 1,
    recommendedActions: ''
  });

  useEffect(() => {
    // Load existing FMEA items and initialize auto-save
    loadFMEAItems();
    initializeAutoSave();
    
    // Cleanup auto-save on unmount
    return () => {
      fmeaService.setAutoSave(false);
    };
  }, []);

  useEffect(() => {
    // Update auto-save when preference changes
    fmeaService.setAutoSave(autoSaveEnabled);
  }, [autoSaveEnabled]);

  const loadFMEAItems = () => {
    try {
      const items = fmeaService.getAllFMEAItems();
      setFmeaItems(items);
      setSaveStatus('Data loaded');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error loading FMEA items:', error);
      setSaveStatus('Error loading data');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const initializeAutoSave = () => {
    const preferences = storageService.loadPreferences();
    setAutoSaveEnabled(preferences.autoSave);
    
    // Set up auto-save callback
    fmeaService.setAutoSave(preferences.autoSave);
    
    // Update last saved time when auto-save occurs
    const originalSaveToStorage = fmeaService.saveToStorage;
    fmeaService.saveToStorage = function() {
      const result = originalSaveToStorage.call(this);
      if (result) {
        setLastSaved(new Date());
        setSaveStatus('Auto-saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
      return result;
    };
  };

  const manualSave = () => {
    try {
      const success = fmeaService.saveToStorage();
      if (success) {
        setLastSaved(new Date());
        setSaveStatus('Saved manually');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Save failed');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving FMEA items:', error);
      setSaveStatus('Save error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  useEffect(() => {
    // Pre-populate component if system is selected
    if (currentSystem && currentSystem.components.length > 0) {
      setCurrentItem(prev => ({
        ...prev,
        component: currentSystem.components[0].name,
        function: currentSystem.components[0].function
      }));
    }
  }, [currentSystem]);

  const handleAddItem = () => {
    setCurrentItem({
      component: currentSystem?.components[0]?.name || '',
      function: currentSystem?.components[0]?.function || '',
      failureMode: '',
      effects: '',
      causes: '',
      currentControls: '',
      severity: 1,
      occurrence: 1,
      detection: 1,
      recommendedActions: ''
    });
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem({ ...item });
    setEditingItem(item.id);
    setDialogOpen(true);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this FMEA item?')) {
      try {
        fmeaService.deleteFMEAItem(id);
        setFmeaItems(fmeaService.getAllFMEAItems());
        setLastSaved(new Date());
        setSaveStatus('Item deleted');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error deleting FMEA item:', error);
        setSaveStatus('Error deleting item');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  const handleSaveItem = () => {
    try {
      if (editingItem) {
        fmeaService.updateFMEAItem(editingItem, currentItem);
        setSaveStatus('Item updated');
      } else {
        fmeaService.createFMEAItem(currentItem);
        setSaveStatus('Item added');
      }
      
      setFmeaItems(fmeaService.getAllFMEAItems());
      setDialogOpen(false);
      setAiSuggestions([]);
      setShowAISuggestions(false);
      setLastSaved(new Date());
      
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving FMEA item:', error);
      setSaveStatus('Error saving item');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRPN = (severity, occurrence, detection) => {
    return severity * occurrence * detection;
  };

  const getRPNColor = (rpn) => {
    if (rpn >= RPN_THRESHOLDS.CRITICAL) return 'error';
    if (rpn >= RPN_THRESHOLDS.HIGH) return 'warning';
    if (rpn >= RPN_THRESHOLDS.MEDIUM) return 'info';
    return 'success';
  };

  const getRPNLabel = (rpn) => {
    if (rpn >= RPN_THRESHOLDS.CRITICAL) return 'Critical';
    if (rpn >= RPN_THRESHOLDS.HIGH) return 'High';
    if (rpn >= RPN_THRESHOLDS.MEDIUM) return 'Medium';
    return 'Low';
  };

  const generateAISuggestions = async () => {
    setLoading(true);
    setShowAISuggestions(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const suggestions = fmeaService.generateFailureModeSuggestions(
        currentItem.component,
        currentItem.function
      );
      setAiSuggestions(suggestions);
      setLoading(false);
    }, 1500);
  };

  const applySuggestion = (suggestion) => {
    setCurrentItem(prev => ({
      ...prev,
      failureMode: suggestion.failureMode,
      effects: suggestion.effects.join(', '),
      causes: suggestion.causes.join(', '),
      severity: suggestion.severity,
      occurrence: suggestion.occurrence,
      detection: suggestion.detection,
      recommendedActions: suggestion.recommendedActions.join(', ')
    }));
  };

  const handleExportData = () => {
    try {
      const exportData = fmeaService.exportFMEAItems();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fmea-analysis-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaveStatus('Data exported');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveStatus('Export failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all FMEA data? This action cannot be undone.')) {
      try {
        fmeaService.clearAllItems();
        setFmeaItems([]);
        setLastSaved(new Date());
        setSaveStatus('All data cleared');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error clearing data:', error);
        setSaveStatus('Error clearing data');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  const toggleAutoSave = () => {
    const newAutoSaveState = !autoSaveEnabled;
    setAutoSaveEnabled(newAutoSaveState);
    storageService.setPreference('autoSave', newAutoSaveState);
    setSaveStatus(newAutoSaveState ? 'Auto-save enabled' : 'Auto-save disabled');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return lastSaved.toLocaleDateString();
  };

  const renderFMEATable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Component</TableCell>
            <TableCell>Function</TableCell>
            <TableCell>Failure Mode</TableCell>
            <TableCell>Effects</TableCell>
            <TableCell>Causes</TableCell>
            <TableCell>S</TableCell>
            <TableCell>O</TableCell>
            <TableCell>D</TableCell>
            <TableCell>RPN</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fmeaItems.map((item) => {
            const rpn = calculateRPN(item.severity, item.occurrence, item.detection);
            return (
              <TableRow key={item.id}>
                <TableCell>{item.component}</TableCell>
                <TableCell>{item.function}</TableCell>
                <TableCell>{item.failureMode}</TableCell>
                <TableCell>{item.effects}</TableCell>
                <TableCell>{item.causes}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.severity} 
                    size="small" 
                    color={item.severity >= 8 ? 'error' : item.severity >= 5 ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.occurrence} 
                    size="small" 
                    color={item.occurrence >= 8 ? 'error' : item.occurrence >= 5 ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.detection} 
                    size="small" 
                    color={item.detection >= 8 ? 'error' : item.detection >= 5 ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${rpn} (${getRPNLabel(rpn)})`}
                    color={getRPNColor(rpn)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAISuggestions = () => (
    <Accordion expanded={showAISuggestions}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">AI-Powered Suggestions</Typography>
          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Analyzing component and generating failure mode suggestions...
            </Typography>
          </Box>
        ) : aiSuggestions.length > 0 ? (
          <List>
            {aiSuggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <LightbulbIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion.failureMode}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          <strong>Effects:</strong> {suggestion.effects.join(', ')}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          <strong>Causes:</strong> {suggestion.causes.join(', ')}
                        </Typography>
                        <br />
                        <Box sx={{ mt: 1 }}>
                          <Chip label={`S: ${suggestion.severity}`} size="small" sx={{ mr: 0.5 }} />
                          <Chip label={`O: ${suggestion.occurrence}`} size="small" sx={{ mr: 0.5 }} />
                          <Chip label={`D: ${suggestion.detection}`} size="small" sx={{ mr: 0.5 }} />
                          <Chip 
                            label={`RPN: ${suggestion.severity * suggestion.occurrence * suggestion.detection}`}
                            color={getRPNColor(suggestion.severity * suggestion.occurrence * suggestion.detection)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < aiSuggestions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No suggestions available. Try entering a component and function first.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderFMEADialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingItem ? 'Edit FMEA Item' : 'Add FMEA Item'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Component Selection */}
          <Grid item xs={12} md={6}>
            {currentSystem ? (
              <FormControl fullWidth>
                <InputLabel>Component</InputLabel>
                <Select
                  value={currentItem.component}
                  onChange={(e) => {
                    const selectedComponent = currentSystem.components.find(c => c.name === e.target.value);
                    handleInputChange('component', e.target.value);
                    if (selectedComponent) {
                      handleInputChange('function', selectedComponent.function);
                    }
                  }}
                  label="Component"
                >
                  {currentSystem.components.map((component) => (
                    <MenuItem key={component.name} value={component.name}>
                      {component.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label="Component"
                value={currentItem.component}
                onChange={(e) => handleInputChange('component', e.target.value)}
                required
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Function"
              value={currentItem.function}
              onChange={(e) => handleInputChange('function', e.target.value)}
              required
            />
          </Grid>

          {/* AI Suggestions Button */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={generateAISuggestions}
              disabled={!currentItem.component || !currentItem.function}
              fullWidth
            >
              Generate AI Suggestions
            </Button>
          </Grid>

          {/* AI Suggestions Panel */}
          <Grid item xs={12}>
            {renderAISuggestions()}
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Failure Mode"
              value={currentItem.failureMode}
              onChange={(e) => handleInputChange('failureMode', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Effects"
              value={currentItem.effects}
              onChange={(e) => handleInputChange('effects', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Causes"
              value={currentItem.causes}
              onChange={(e) => handleInputChange('causes', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Current Controls"
              value={currentItem.currentControls}
              onChange={(e) => handleInputChange('currentControls', e.target.value)}
            />
          </Grid>

          {/* Severity, Occurrence, Detection */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={currentItem.severity}
                onChange={(e) => handleInputChange('severity', e.target.value)}
                label="Severity"
              >
                {Object.entries(SEVERITY_LEVELS).map(([value, { label, description }]) => (
                  <MenuItem key={value} value={parseInt(value)}>
                    <Box>
                      <Typography variant="body2">{value} - {label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Occurrence</InputLabel>
              <Select
                value={currentItem.occurrence}
                onChange={(e) => handleInputChange('occurrence', e.target.value)}
                label="Occurrence"
              >
                {Object.entries(OCCURRENCE_LEVELS).map(([value, { label, description }]) => (
                  <MenuItem key={value} value={parseInt(value)}>
                    <Box>
                      <Typography variant="body2">{value} - {label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Detection</InputLabel>
              <Select
                value={currentItem.detection}
                onChange={(e) => handleInputChange('detection', e.target.value)}
                label="Detection"
              >
                {Object.entries(DETECTION_LEVELS).map(([value, { label, description }]) => (
                  <MenuItem key={value} value={parseInt(value)}>
                    <Box>
                      <Typography variant="body2">{value} - {label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* RPN Display */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Priority Number (RPN)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h4">
                    {calculateRPN(currentItem.severity, currentItem.occurrence, currentItem.detection)}
                  </Typography>
                  <Chip 
                    label={getRPNLabel(calculateRPN(currentItem.severity, currentItem.occurrence, currentItem.detection))}
                    color={getRPNColor(calculateRPN(currentItem.severity, currentItem.occurrence, currentItem.detection))}
                  />
                  <Typography variant="body2" color="text.secondary">
                    = {currentItem.severity} × {currentItem.occurrence} × {currentItem.detection}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Recommended Actions"
              value={currentItem.recommendedActions}
              onChange={(e) => handleInputChange('recommendedActions', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveItem}
          variant="contained"
          disabled={!currentItem.component || !currentItem.function || !currentItem.failureMode}
        >
          {editingItem ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            FMEA Analysis
          </Typography>
          {currentSystem && (
            <Typography variant="subtitle1" color="text.secondary">
              System: {currentSystem.name}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            {saveStatus && (
              <Typography
                variant="body2"
                color={saveStatus.includes('Error') || saveStatus.includes('failed') ? 'error' : 'success.main'}
              >
                {saveStatus}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Last saved: {formatLastSaved()}
            </Typography>
            <Chip
              label={autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
              size="small"
              color={autoSaveEnabled ? 'success' : 'default'}
              onClick={toggleAutoSave}
              clickable
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add FMEA Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={manualSave}
              size="small"
            >
              Save
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleExportData}
              size="small"
              disabled={fmeaItems.length === 0}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAllData}
              size="small"
              disabled={fmeaItems.length === 0}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Box>

      {!currentSystem && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            No system selected. Go to the System Input tab to define your system first, or continue with manual component entry.
          </Typography>
        </Alert>
      )}

      {fmeaItems.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No FMEA items yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Click "Add FMEA Item" to start your failure mode and effects analysis
            </Typography>
            {currentSystem && (
              <Typography variant="body2" color="primary">
                System "{currentSystem.name}" is ready for analysis with {currentSystem.components.length} components
              </Typography>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{fmeaItems.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Items</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {fmeaItems.filter(item => item.rpn >= RPN_THRESHOLDS.HIGH).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">High Risk</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {fmeaItems.length > 0 ? Math.round(fmeaItems.reduce((sum, item) => sum + item.rpn, 0) / fmeaItems.length) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg RPN</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {fmeaItems.length > 0 ? Math.max(...fmeaItems.map(item => item.rpn)) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Max RPN</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {renderFMEATable()}
        </>
      )}

      {renderFMEADialog()}
    </Paper>
  );
};

export default FMEAAnalysis;