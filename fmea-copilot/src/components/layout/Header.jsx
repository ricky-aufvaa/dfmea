import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FMEA Copilot
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Navigation items will be added here */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;