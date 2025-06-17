import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

function History() {
  const [valuations, setValuations] = useState([]);

  useEffect(() => {
    fetchValuations();
  }, []);

  const fetchValuations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/valuations');
      setValuations(response.data);
    } catch (error) {
      console.error('Error fetching valuations:', error);
      // TODO: Add error handling UI
    }
  };

  const handleViewValuation = (valuation) => {
    // TODO: Implement view valuation details
    console.log('View valuation:', valuation);
  };

  const handleDeleteValuation = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/valuations/${id}`);
      fetchValuations();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Valuation History
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Property Address</TableCell>
                <TableCell>Final Valuation</TableCell>
                <TableCell>Comparables</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valuations.map((valuation) => (
                <TableRow key={valuation.id}>
                  <TableCell>
                    {new Date(valuation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{valuation.property.address}</TableCell>
                  <TableCell>
                    ${valuation.final_valuation.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {valuation.comparable_adjustments.length} properties
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewValuation(valuation)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteValuation(valuation.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default History; 