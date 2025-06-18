import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class PropertyService {
  // Property data management
  async getProperties() {
    try {
      const response = await axios.get(`${API_URL}/api/properties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getPropertyById(id) {
    try {
      const response = await axios.get(`${API_URL}/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async createProperty(propertyData) {
    try {
      const response = await axios.post(`${API_URL}/api/properties`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id, propertyData) {
    try {
      const response = await axios.put(`${API_URL}/api/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  // Valuation calculations
  async calculateValuation(subjectProperty, comparableProperties) {
    try {
      const response = await axios.post(`${API_URL}/api/valuation/calculate`, {
        subjectProperty,
        comparableProperties,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating valuation:', error);
      throw error;
    }
  }

  // Adjustment calculations
  calculateAreaAdjustment(subjectArea, comparableArea) {
    const areaDifference = subjectArea - comparableArea;
    const adjustmentRate = 0.01; // 1% per square meter
    return areaDifference * adjustmentRate;
  }

  calculateFloorAdjustment(subjectFloor, comparableFloor) {
    const floorDifference = subjectFloor - comparableFloor;
    const adjustmentRate = 0.02; // 2% per floor
    return floorDifference * adjustmentRate;
  }

  calculateConditionAdjustment(subjectCondition, comparableCondition) {
    const conditionValues = {
      excellent: 1.0,
      good: 0.9,
      fair: 0.8,
      poor: 0.7,
    };
    return (conditionValues[subjectCondition] - conditionValues[comparableCondition]) * 100;
  }

  calculateDistanceAdjustment(subjectLocation, comparableLocation) {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(comparableLocation.lat - subjectLocation.lat);
    const dLon = this.toRad(comparableLocation.lng - subjectLocation.lng);
    const lat1 = this.toRad(subjectLocation.lat);
    const lat2 = this.toRad(comparableLocation.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Adjust price based on distance (0.5% per km)
    return distance * 0.005;
  }

  calculateRenovationAdjustment(subjectRenovation, comparableRenovation) {
    const renovationValues = {
      new: 1.0,
      renovated: 0.95,
      partial: 0.9,
      none: 0.85,
    };
    return (renovationValues[subjectRenovation] - renovationValues[comparableRenovation]) * 100;
  }

  // Helper methods
  toRad(value) {
    return value * Math.PI / 180;
  }

  // History management
  async getValuationHistory() {
    try {
      const response = await axios.get(`${API_URL}/api/valuation/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching valuation history:', error);
      throw error;
    }
  }

  async saveValuationResult(valuationData) {
    try {
      const response = await axios.post(`${API_URL}/api/valuation/history`, valuationData);
      return response.data;
    } catch (error) {
      console.error('Error saving valuation result:', error);
      throw error;
    }
  }

  // Export functionality
  async exportToPDF(valuationData) {
    try {
      const response = await axios.post(`${API_URL}/api/export/pdf`, valuationData, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  async exportToExcel(valuationData) {
    try {
      const response = await axios.post(`${API_URL}/api/export/excel`, valuationData, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
}

export default new PropertyService(); 