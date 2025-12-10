/**
 * Hook personnalisé pour gérer le formulaire de chat
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useChatForm(isConfigured) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [propertyValues, setPropertyValues] = useState({});

  useEffect(() => {
    if (isConfigured) {
      loadProperties();
    }
  }, [isConfigured]);

  const loadProperties = async () => {
    try {
      const [propertiesResponse, configResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/config/properties`),
        axios.get(`${API_BASE_URL}/api/config`)
      ]);
      
      const allProperties = propertiesResponse.data.properties || [];
      const selected = configResponse.data.additionalProperties || {};
      
      setAvailableProperties(allProperties);
      setSelectedProperties(selected);
      
      const initialValues = {};
      allProperties.forEach(prop => {
        if (selected[prop.name]) {
          initialValues[prop.name] = '';
        }
      });
      setPropertyValues(initialValues);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
    }
  };

  const handlePropertyChange = (propName, value) => {
    setPropertyValues(prev => ({ ...prev, [propName]: value }));
  };

  const resetForm = () => {
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    const resetValues = {};
    Object.keys(propertyValues).forEach(propName => {
      resetValues[propName] = '';
    });
    setPropertyValues(resetValues);
    setProgress(0);
  };

  return {
    content,
    setContent,
    date,
    setDate,
    loading,
    setLoading,
    progress,
    setProgress,
    availableProperties,
    selectedProperties,
    propertyValues,
    handlePropertyChange,
    resetForm
  };
}

