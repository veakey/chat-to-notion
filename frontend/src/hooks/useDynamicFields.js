/**
 * Hook personnalisé pour gérer les champs dynamiques
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useDynamicFields(isConfigured, activeConfigId) {
  const [dynamicFields, setDynamicFields] = useState([]);
  const [missingProperties, setMissingProperties] = useState([]);

  useEffect(() => {
    if (isConfigured && activeConfigId) {
      loadDynamicFields(activeConfigId);
    }
  }, [isConfigured, activeConfigId]);

  const loadDynamicFields = async (configId) => {
    try {
      const configResponse = await axios.get(`${API_BASE_URL}/api/config`, {
        params: { configId },
      });
      const savedDynamicFields = configResponse.data.dynamicFields || [];
      
      if (savedDynamicFields.length > 0) {
        const loadedFields = savedDynamicFields.map((field, index) => ({
          id: field.id || Date.now() + index,
          name: field.name || '',
          type: field.type || 'rich_text',
          value: field.value || ''
        }));
        setDynamicFields(loadedFields);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des champs dynamiques:', err);
    }
  };

  const saveDynamicFields = async (fieldsToSave = null) => {
    const fields = fieldsToSave || dynamicFields;
    const fieldsToSaveStructure = fields.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type
    }));
    try {
      await axios.post(`${API_BASE_URL}/api/config/dynamic-fields`, {
        dynamicFields: fieldsToSaveStructure,
        configId: activeConfigId,
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des champs dynamiques:', err);
    }
  };

  const addDynamicField = () => {
    if (!activeConfigId) return false;
    if (dynamicFields.length >= 10) {
      return false;
    }
    const newField = { id: Date.now(), name: '', type: 'rich_text', value: '' };
    const updatedFields = [...dynamicFields, newField];
    setDynamicFields(updatedFields);
    saveDynamicFields(updatedFields);
    return true;
  };

  const removeDynamicField = (id) => {
    if (!activeConfigId) return;
    const field = dynamicFields.find(f => f.id === id);
    const updatedFields = dynamicFields.filter(f => f.id !== id);
    setDynamicFields(updatedFields);
    
    if (field) {
      setMissingProperties(prev => prev.filter(name => name !== field.name));
    }
    
    saveDynamicFields(updatedFields);
  };

  const updateDynamicField = (id, field, value) => {
    if (!activeConfigId) return;
    const updatedFields = dynamicFields.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setDynamicFields(updatedFields);
    
    if (field === 'name') {
      const oldField = dynamicFields.find(f => f.id === id);
      if (oldField) {
        setMissingProperties(prev => prev.filter(name => name !== oldField.name));
      }
    }
    
    saveDynamicFields(updatedFields);
  };

  const resetDynamicFieldsValues = () => {
    setDynamicFields(prev => prev.map(f => ({ ...f, value: '' })));
  };

  return {
    dynamicFields,
    missingProperties,
    setMissingProperties,
    addDynamicField,
    removeDynamicField,
    updateDynamicField,
    resetDynamicFieldsValues
  };
}

