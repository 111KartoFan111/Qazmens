import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Real Estate Valuation
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/results"
            startIcon={<AssessmentIcon />}
          >
            Results
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/history"
            startIcon={<HistoryIcon />}
          >
            History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 