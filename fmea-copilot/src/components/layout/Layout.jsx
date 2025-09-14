import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container 
        maxWidth="xl" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;