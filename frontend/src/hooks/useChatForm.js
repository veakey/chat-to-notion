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
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (isConfigured) {
      loadProperties();
    } else {
      setInitialLoading(false);
    }
  }, [isConfigured]);

  const loadProperties = async () => {
    setInitialLoading(true);
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
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePropertyChange = (propName, value) => {
    setPropertyValues(prev => ({ ...prev, [propName]: value }));
  };

  const handleAddProperty = async (propName) => {
    const updated = { ...selectedProperties, [propName]: true };
    setSelectedProperties(updated);
    
    // Ajouter la valeur initiale
    if (!propertyValues[propName]) {
      setPropertyValues(prev => ({ ...prev, [propName]: '' }));
    }
    
    // Sauvegarder la configuration
    try {
      await axios.post(`${API_BASE_URL}/api/config/properties`, {
        additionalProperties: updated
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      // Revert on error
      setSelectedProperties(selectedProperties);
    }
  };

  const handleRemoveProperty = async (propName) => {
    const updated = { ...selectedProperties };
    delete updated[propName];
    setSelectedProperties(updated);
    
    // Supprimer la valeur
    const newValues = { ...propertyValues };
    delete newValues[propName];
    setPropertyValues(newValues);
    
    // Sauvegarder la configuration
    try {
      await axios.post(`${API_BASE_URL}/api/config/properties`, {
        additionalProperties: updated
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      // Revert on error
      setSelectedProperties(selectedProperties);
      setPropertyValues(propertyValues);
    }
  };

  const refreshProperties = async () => {
    await loadProperties();
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
    initialLoading,
    handlePropertyChange,
    handleAddProperty,
    handleRemoveProperty,
    refreshProperties,
    loadProperties,
    resetForm
  };
}

