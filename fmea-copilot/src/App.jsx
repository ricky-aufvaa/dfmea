import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Tabs, Tab, Box } from '@mui/material';
import Layout from './components/layout/Layout';
import SystemInput from './components/system/SystemInput';
import FMEAAnalysis from './components/fmea/FMEAAnalysis';
import KnowledgeGraph from './components/knowledge/KnowledgeGraph';
import ProjectManager from './components/project/ProjectManager';
import DataManager from './components/data/DataManager';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationProvider from './components/common/NotificationProvider';
import { COLORS } from './utils/constants';
import projectService from './services/projectService';
import storageService from './services/storageService';
import notificationService from './services/notificationService';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        flexGrow: 1,
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 3,
          height: '100%'
        }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);

  // Load current project on app start
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await notificationService.withLoading('app_init', async () => {
        // Load current project
        const project = projectService.getCurrentProject();
        if (project) {
          setCurrentProject(project);
          notificationService.showInfo(`Loaded project: ${project.name}`);
          
          // Load system data if exists
          const systemData = storageService.getSystemData();
          if (systemData) {
            setCurrentSystem(systemData);
          }
        }

        // Initialize project auto-save
        projectService.initializeProjectAutoSave();
        
        // Check for any stored error logs
        const errorLogs = notificationService.getErrorLogs();
        if (errorLogs.length > 0) {
          notificationService.showWarning(`Found ${errorLogs.length} error logs from previous sessions`);
        }
      }, 'Initializing application...');
    } catch (error) {
      notificationService.logError(error, 'App Initialization');
    }
  };

  const handleNavigateHome = () => {
    setTabValue(0);
    setCurrentProject(null);
    setCurrentSystem(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSystemCreated = async (systemData) => {
    try {
      await notificationService.withNotifications(async () => {
        setCurrentSystem(systemData);
        
        // Save system data to current project if exists
        if (currentProject) {
          projectService.saveCurrentProject();
        }
        
        setTabValue(2); // Switch to FMEA Analysis tab
      }, {
        loadingKey: 'system_create',
        loadingMessage: 'Saving system configuration...',
        successMessage: 'System configuration saved successfully',
        errorMessage: 'Failed to save system configuration'
      });
    } catch (error) {
      notificationService.logError(error, 'System Creation');
    }
  };

  const handleProjectSelected = async (project) => {
    try {
      await notificationService.withLoading('project_load', async () => {
        setCurrentProject(project);
        
        if (project) {
          // Load project data
          const systemData = storageService.getSystemData();
          setCurrentSystem(systemData);
          
          // Switch to appropriate tab based on project state
          if (systemData) {
            setTabValue(2); // FMEA Analysis if system exists
            notificationService.showSuccess(`Loaded project: ${project.name}`);
          } else {
            setTabValue(1); // System Input if no system
            notificationService.showInfo(`Project loaded: ${project.name}. Please configure the system.`);
          }
        } else {
          // Clear current data when no project selected
          setCurrentSystem(null);
          setTabValue(0); // Go to Project Manager
        }
      }, 'Loading project...');
    } catch (error) {
      notificationService.logError(error, 'Project Selection');
    }
  };

  return (
    <ErrorBoundary onNavigateHome={handleNavigateHome}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Layout>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="FMEA Copilot tabs">
            <Tab label="Projects" />
            <Tab label="System Input" />
            <Tab label="FMEA Analysis" />
            <Tab label="Knowledge Graph" />
            <Tab label="Data Manager" />
            <Tab label="Historical Cases" />
            <Tab label="Standards" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ProjectManager
            onProjectSelected={handleProjectSelected}
            currentProject={currentProject}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <SystemInput onSystemCreated={handleSystemCreated} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <FMEAAnalysis currentSystem={currentSystem} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <KnowledgeGraph />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <DataManager currentProject={currentProject} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <h2>Historical Cases</h2>
            <p>Historical FMEA cases and lessons learned will be displayed here.</p>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <h2>Standards & Guidelines</h2>
            <p>Industry standards and FMEA guidelines will be displayed here.</p>
          </Box>
        </TabPanel>
          </Layout>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
