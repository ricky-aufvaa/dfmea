import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  LinearProgress,
  Typography,
  Backdrop,
  CircularProgress,
  Paper
} from '@mui/material';
import notificationService from '../../services/notificationService';

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loadingStates, setLoadingStates] = useState(new Map());

  useEffect(() => {
    // Subscribe to notification service
    const unsubscribe = notificationService.subscribe(({ notifications, loadingStates }) => {
      setNotifications(notifications);
      setLoadingStates(loadingStates);
    });

    // Validate storage on mount
    notificationService.validateStorage();

    return unsubscribe;
  }, []);

  const handleCloseNotification = (notificationId) => {
    notificationService.removeNotification(notificationId);
  };

  const isAnyLoading = loadingStates.size > 0;
  const loadingArray = Array.from(loadingStates.entries());

  return (
    <>
      {children}
      
      {/* Global Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isAnyLoading}
      >
        <CircularProgress color="inherit" />
        {loadingArray.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            {loadingArray.map(([key, state]) => (
              <Typography key={key} variant="body2" color="inherit" align="center">
                {state.message || 'Loading...'}
              </Typography>
            ))}
          </Paper>
        )}
      </Backdrop>

      {/* Loading Progress Bar */}
      {isAnyLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: (theme) => theme.zIndex.appBar + 1 
        }}>
          <LinearProgress />
        </Box>
      )}

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHide ? notification.duration : null}
          onClose={() => handleCloseNotification(notification.id)}
          anchorOrigin={{ 
            vertical: 'top', 
            horizontal: 'right' 
          }}
          sx={{
            mt: index * 7, // Stack notifications
          }}
        >
          <Alert
            onClose={() => handleCloseNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationProvider;