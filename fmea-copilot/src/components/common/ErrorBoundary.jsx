import React from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service if available
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real application, you would send this to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('fmea_error_logs') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('fmea_error_logs', JSON.stringify(recentErrors));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Navigate to home if router is available
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" component="h1">
                  Something went wrong
                </Typography>
              </Box>
              
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  The application encountered an unexpected error and needs to be reloaded.
                </Typography>
                {this.state.error && (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                    {this.state.error.message}
                  </Typography>
                )}
              </Alert>

              <Typography variant="body2" color="text.secondary" paragraph>
                This error has been logged for debugging purposes. You can try reloading the page or returning to the home screen.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Error Details (Development Mode):
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {this.state.error && this.state.error.stack}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              )}
            </CardContent>
            
            <CardActions>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
            </CardActions>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;