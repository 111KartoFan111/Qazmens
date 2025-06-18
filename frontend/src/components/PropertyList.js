import React, { useEffect } from 'react';
import { 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress, 
    Alert,
    Typography,
    Box
} from '@mui/material';
import { propertyApi } from '../services/api';
import { useApi } from '../hooks/useApi';

const PropertyList = () => {
    const { data: properties, loading, error, execute: fetchProperties } = useApi(propertyApi.getProperties);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                Properties
            </Typography>
            <List>
                {properties?.map((property) => (
                    <ListItem key={property.id} divider>
                        <ListItemText
                            primary={property.address}
                            secondary={`Type: ${property.property_type} | Price: $${property.price}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default PropertyList; 