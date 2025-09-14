import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  ElectricBolt as ElectricIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import storageService from '../../services/storageService';

// System templates for commercial vehicles
const systemTemplates = {
  airBrake: {
    id: 'air_brake',
    name: 'Air Brake System',
    icon: <SecurityIcon />,
    description: 'Pneumatic braking system for commercial vehicles',
    category: 'Safety Critical',
    components: [
      { name: 'Air Compressor', function: 'Generate compressed air', criticality: 'High' },
      { name: 'Air Tank/Reservoir', function: 'Store compressed air', criticality: 'High' },
      { name: 'Brake Valve', function: 'Control air flow to brakes', criticality: 'High' },
      { name: 'Brake Chamber', function: 'Convert air pressure to mechanical force', criticality: 'High' },
      { name: 'Brake Shoes/Pads', function: 'Create friction to stop vehicle', criticality: 'High' },
      { name: 'Air Lines', function: 'Transport compressed air', criticality: 'Medium' },
      { name: 'Pressure Regulator', function: 'Maintain proper air pressure', criticality: 'Medium' },
      { name: 'Safety Valve', function: 'Prevent over-pressurization', criticality: 'High' }
    ],
    commonFailureModes: [
      'Air leakage',
      'Compressor failure',
      'Valve malfunction',
      'Brake fade',
      'Contamination'
    ],
    operatingConditions: {
      temperature: '-40°C to 85°C',
      pressure: '8.5 to 10 bar',
      humidity: '0-100% RH',
      vibration: 'High'
    }
  },
  engineManagement: {
    id: 'engine_management',
    name: 'Engine Management System',
    icon: <BuildIcon />,
    description: 'Electronic control system for engine operation',
    category: 'Performance Critical',
    components: [
      { name: 'ECU (Engine Control Unit)', function: 'Control engine parameters', criticality: 'High' },
      { name: 'Fuel Injectors', function: 'Deliver precise fuel amounts', criticality: 'High' },
      { name: 'Throttle Body', function: 'Control air intake', criticality: 'High' },
      { name: 'Mass Air Flow Sensor', function: 'Measure air intake', criticality: 'Medium' },
      { name: 'Oxygen Sensors', function: 'Monitor exhaust gases', criticality: 'Medium' },
      { name: 'Crankshaft Position Sensor', function: 'Monitor engine timing', criticality: 'High' },
      { name: 'Camshaft Position Sensor', function: 'Monitor valve timing', criticality: 'High' },
      { name: 'Coolant Temperature Sensor', function: 'Monitor engine temperature', criticality: 'Medium' }
    ],
    commonFailureModes: [
      'Sensor failure',
      'ECU malfunction',
      'Injector clogging',
      'Wiring issues',
      'Software corruption'
    ],
    operatingConditions: {
      temperature: '-40°C to 125°C',
      voltage: '12V/24V DC',
      humidity: '0-95% RH',
      vibration: 'High'
    }
  },
  electricPowerSteering: {
    id: 'electric_power_steering',
    name: 'Electric Power Steering',
    icon: <ElectricIcon />,
    description: 'Electrically assisted steering system',
    category: 'Safety Critical',
    components: [
      { name: 'Electric Motor', function: 'Provide steering assistance', criticality: 'High' },
      { name: 'Steering ECU', function: 'Control steering assistance', criticality: 'High' },
      { name: 'Torque Sensor', function: 'Measure steering input', criticality: 'High' },
      { name: 'Position Sensor', function: 'Monitor steering angle', criticality: 'Medium' },
      { name: 'Power Supply Unit', function: 'Provide electrical power', criticality: 'High' },
      { name: 'Steering Column', function: 'Transfer steering input', criticality: 'High' },
      { name: 'Wiring Harness', function: 'Electrical connections', criticality: 'Medium' },
      { name: 'Fail-Safe Mechanism', function: 'Ensure manual steering backup', criticality: 'High' }
    ],
    commonFailureModes: [
      'Motor failure',
      'Sensor malfunction',
      'ECU failure',
      'Power loss',
      'Mechanical binding'
    ],
    operatingConditions: {
      temperature: '-40°C to 85°C',
      voltage: '12V DC',
      humidity: '0-95% RH',
      vibration: 'Medium'
    }
  }
};

const steps = ['Select Template', 'Configure System', 'Define Components', 'Review & Save'];

const SystemInput = ({ onSystemCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [systemData, setSystemData] = useState({
    name: '',
    description: '',
    category: '',
    operatingConditions: {},
    components: []
  });
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [newComponent, setNewComponent] = useState({
    name: '',
    function: '',
    criticality: 'Medium',
    specifications: ''
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load existing system data on component mount
  useEffect(() => {
    loadExistingSystemData();
  }, []);

  // Auto-save system data when it changes
  useEffect(() => {
    if (systemData.name && systemData.components.length > 0) {
      autoSaveSystemData();
    }
  }, [systemData]);

  const loadExistingSystemData = () => {
    try {
      const existingSystem = storageService.getSystemData();
      if (existingSystem) {
        setSystemData(existingSystem);
        // Find matching template if exists
        const matchingTemplate = Object.values(systemTemplates).find(
          template => template.id === existingSystem.template
        );
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate);
        }
        setSaveStatus('Loaded existing system data');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  };

  const autoSaveSystemData = () => {
    try {
      const success = storageService.saveSystemData(systemData);
      if (success) {
        setSaveStatus('Auto-saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Error auto-saving system data:', error);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSystemData({
      name: template.name,
      description: template.description,
      category: template.category,
      operatingConditions: template.operatingConditions,
      components: [...template.components]
    });
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSystemDataChange = (field, value) => {
    setSystemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddComponent = () => {
    setNewComponent({
      name: '',
      function: '',
      criticality: 'Medium',
      specifications: ''
    });
    setEditingComponent(null);
    setComponentDialogOpen(true);
  };

  const handleEditComponent = (index) => {
    setNewComponent(systemData.components[index]);
    setEditingComponent(index);
    setComponentDialogOpen(true);
  };

  const handleSaveComponent = () => {
    if (editingComponent !== null) {
      const updatedComponents = [...systemData.components];
      updatedComponents[editingComponent] = newComponent;
      setSystemData(prev => ({ ...prev, components: updatedComponents }));
    } else {
      setSystemData(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
    }
    setComponentDialogOpen(false);
  };

  const handleDeleteComponent = (index) => {
    const updatedComponents = systemData.components.filter((_, i) => i !== index);
    setSystemData(prev => ({ ...prev, components: updatedComponents }));
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    setSaveStatus('Saving...');
    
    try {
      const finalSystemData = {
        ...systemData,
        id: systemData.id || `system_${Date.now()}`,
        template: selectedTemplate?.id,
        createdAt: systemData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to storage
      const success = storageService.saveSystemData(finalSystemData);
      
      if (success) {
        setSaveStatus('System saved successfully!');
        
        if (onSystemCreated) {
          onSystemCreated(finalSystemData);
        }
        
        // Reset form after successful save
        setTimeout(() => {
          setActiveStep(0);
          setSelectedTemplate(null);
          setSystemData({
            name: '',
            description: '',
            category: '',
            operatingConditions: {},
            components: []
          });
          setSaveStatus('');
        }, 2000);
      } else {
        setSaveStatus('Failed to save system');
      }
    } catch (error) {
      console.error('Error saving system:', error);
      setSaveStatus('Error saving system');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClearSystem = () => {
    if (window.confirm('Are you sure you want to clear the current system? This will remove all unsaved changes.')) {
      setSystemData({
        name: '',
        description: '',
        category: '',
        operatingConditions: {},
        components: []
      });
      setSelectedTemplate(null);
      setActiveStep(0);
      
      // Clear from storage
      storageService.saveSystemData(null);
      setSaveStatus('System cleared');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const renderTemplateSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Choose a System Template
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a pre-configured template for common commercial vehicle systems, or start with a custom system.
        </Typography>
      </Grid>
      
      {Object.values(systemTemplates).map((template) => (
        <Grid item xs={12} md={6} lg={4} key={template.id}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              '&:hover': { elevation: 4 }
            }}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {template.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {template.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {template.description}
              </Typography>
              <Chip 
                label={template.category} 
                size="small" 
                color={template.category.includes('Safety') ? 'error' : 'primary'}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {template.components.length} components included
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      <Grid item xs={12} md={6} lg={4}>
        <Card 
          sx={{ 
            height: '100%', 
            cursor: 'pointer',
            border: '2px dashed #ccc',
            '&:hover': { borderColor: 'primary.main' }
          }}
          onClick={() => {
            setSelectedTemplate(null);
            setSystemData({
              name: '',
              description: '',
              category: '',
              operatingConditions: {},
              components: []
            });
            setActiveStep(1);
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Custom System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start with a blank system and define your own components
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSystemConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          System Configuration
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="System Name"
          value={systemData.name}
          onChange={(e) => handleSystemDataChange('name', e.target.value)}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={systemData.category}
            onChange={(e) => handleSystemDataChange('category', e.target.value)}
            label="Category"
          >
            <MenuItem value="Safety Critical">Safety Critical</MenuItem>
            <MenuItem value="Performance Critical">Performance Critical</MenuItem>
            <MenuItem value="Comfort">Comfort</MenuItem>
            <MenuItem value="Auxiliary">Auxiliary</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="System Description"
          value={systemData.description}
          onChange={(e) => handleSystemDataChange('description', e.target.value)}
        />
      </Grid>
      
      {selectedTemplate && (
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Operating Conditions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(selectedTemplate.operatingConditions).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={value}
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}
    </Grid>
  );

  const renderComponentDefinition = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            System Components ({systemData.components.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddComponent}
          >
            Add Component
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <List>
          {systemData.components.map((component, index) => (
            <React.Fragment key={index}>
              <ListItem
                secondaryAction={
                  <Box>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditComponent(index)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteComponent(index)}
                    >
                      Delete
                    </Button>
                  </Box>
                }
              >
                <ListItemIcon>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText
                  primary={component.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        Function: {component.function}
                      </Typography>
                      <br />
                      <Chip 
                        label={`${component.criticality} Criticality`}
                        size="small"
                        color={
                          component.criticality === 'High' ? 'error' :
                          component.criticality === 'Medium' ? 'warning' : 'success'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              {index < systemData.components.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Grid>
    </Grid>
  );

  const renderReviewAndSave = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review System Configuration
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {systemData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {systemData.description}
            </Typography>
            <Chip label={systemData.category} color="primary" size="small" />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Components ({systemData.components.length})
            </Typography>
            <List dense>
              {systemData.components.map((component, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={component.name}
                    secondary={component.function}
                  />
                  <Chip 
                    label={component.criticality}
                    size="small"
                    color={
                      component.criticality === 'High' ? 'error' :
                      component.criticality === 'Medium' ? 'warning' : 'success'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          System Definition
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {saveStatus && (
            <Typography
              variant="body2"
              color={saveStatus.includes('failed') || saveStatus.includes('Error') ? 'error' : 'success.main'}
            >
              {saveStatus}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearSystem}
            size="small"
          >
            Clear System
          </Button>
        </Box>
      </Box>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 3 }}>
        {activeStep === 0 && renderTemplateSelection()}
        {activeStep === 1 && renderSystemConfiguration()}
        {activeStep === 2 && renderComponentDefinition()}
        {activeStep === 3 && renderReviewAndSave()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSaveSystem}
              disabled={!systemData.name || systemData.components.length === 0 || loading}
            >
              {loading ? 'Saving...' : 'Save System'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 1 && !systemData.name) ||
                (activeStep === 2 && systemData.components.length === 0)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Component Dialog */}
      <Dialog 
        open={componentDialogOpen} 
        onClose={() => setComponentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingComponent !== null ? 'Edit Component' : 'Add Component'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Component Name"
                value={newComponent.name}
                onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Function"
                value={newComponent.function}
                onChange={(e) => setNewComponent(prev => ({ ...prev, function: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Criticality</InputLabel>
                <Select
                  value={newComponent.criticality}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, criticality: e.target.value }))}
                  label="Criticality"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Specifications (Optional)"
                value={newComponent.specifications}
                onChange={(e) => setNewComponent(prev => ({ ...prev, specifications: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComponentDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveComponent}
            variant="contained"
            disabled={!newComponent.name || !newComponent.function}
          >
            {editingComponent !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SystemInput;