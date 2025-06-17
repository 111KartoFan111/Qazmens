import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';

function ValuationResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('valuationResults');
    if (!storedResults) {
      navigate('/');
      return;
    }
    setResults(JSON.parse(storedResults));
  }, [navigate]);

  if (!results) {
    return null;
  }

  const chartData = results.comparable_adjustments.map((comp) => ({
    address: comp.address,
    original: comp.original_price,
    adjusted: comp.adjusted_price,
  }));

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Valuation Results
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Final Valuation</TableCell>
                      <TableCell align="right">
                        ${results.final_valuation.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mean Price</TableCell>
                      <TableCell align="right">
                        ${results.mean_price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Median Price</TableCell>
                      <TableCell align="right">
                        ${results.median_price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Standard Deviation</TableCell>
                      <TableCell align="right">
                        ${results.standard_deviation.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price Comparison
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="address" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="original" name="Original Price" fill="#8884d8" />
                    <Bar dataKey="adjusted" name="Adjusted Price" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparable Properties Adjustments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell align="right">Original Price</TableCell>
                      <TableCell align="right">Adjusted Price</TableCell>
                      <TableCell>Adjustments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.comparable_adjustments.map((comp, index) => (
                      <TableRow key={index}>
                        <TableCell>{comp.address}</TableCell>
                        <TableCell align="right">
                          ${comp.original_price.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          ${comp.adjusted_price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {Object.entries(comp.adjustments).map(([key, value]) => (
                            <div key={key}>
                              {key}: ${value.toLocaleString()}
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ValuationResults; 