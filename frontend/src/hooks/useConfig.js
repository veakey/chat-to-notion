/**
 * Hook pour gérer la configuration Notion
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import i18n from '../i18n/config';
import { translateBackendError } from '../utils/errorTranslator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useConfig(isConfigured) {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});
  const [loadingProperties, setLoadingProperties] = useState(false);

  useEffect(() => {
    if (isConfigured) {
      loadProperties();
      loadSelectedProperties();
    }
  }, [isConfigured]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config/properties`);
      setAvailableProperties(response.data.properties || []);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadSelectedProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`);
      setSelectedProperties(response.data.additionalProperties || {});
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
    }
  };

  const handlePropertyToggle = (propName) => {
    setSelectedProperties(prev => ({
      ...prev,
      [propName]: !prev[propName]
    }));
  };

  const handleSaveProperties = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/config/properties`, {
        additionalProperties: selectedProperties
      });
      return { success: true, message: i18n.t('success.propertiesSaved') };
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      return { 
        success: false, 
        error: translateBackendError(errorMessage)
      };
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/config`, {
        apiKey,
        databaseId,
      });

      setApiKey('');
      setDatabaseId('');

      // Charger les propriétés disponibles après la configuration
      setTimeout(() => {
        loadProperties();
      }, 500);

      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      return { 
        success: false, 
        error: translateBackendError(errorMessage)
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    databaseId,
    setDatabaseId,
    loading,
    availableProperties,
    selectedProperties,
    loadingProperties,
    handlePropertyToggle,
    handleSaveProperties,
    handleSubmit
  };
}

