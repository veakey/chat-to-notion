/**
 * Hook pour gérer la soumission du formulaire de chat
 */
import { useState } from 'react';
import axios from 'axios';
import i18n from '../i18n/config';
import { translateBackendError } from '../utils/errorTranslator';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useChatSubmission() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [missingProperties, setMissingProperties] = useState([]);

  const validateDynamicFields = async (dynamicFields) => {
    if (dynamicFields.length === 0) return { valid: true, missing: [] };

    const fieldsToValidate = dynamicFields
      .filter(f => f.name && f.name.trim())
      .map(f => ({ name: f.name, type: f.type }));

    if (fieldsToValidate.length === 0) return { valid: true, missing: [] };

    try {
      setProgress(30);
      const response = await axios.post(`${API_BASE_URL}/api/config/validate-properties`, {
        properties: fieldsToValidate
      });

      const validation = response.data.validation;
      const missing = [];
      Object.keys(validation).forEach(propName => {
        if (!validation[propName].exists) {
          missing.push(propName);
        }
      });

      setMissingProperties(missing);
      setProgress(50);
      return { valid: missing.length === 0, missing };
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      return { valid: true, missing: [] }; // Continuer même en cas d'erreur
    }
  };

  const submitChat = async (content, date, propertyValues, dynamicFields, availableProperties = []) => {
    setLoading(true);
    setProgress(10);

    try {
      // Valider les champs dynamiques
      const validation = await validateDynamicFields(dynamicFields);
      if (!validation.valid && validation.missing.length > 0) {
        setProgress(0);
        setLoading(false);
        return {
          success: false,
          error: i18n.t('chat.missingProperties') + ' ' + validation.missing.join(', ')
        };
      }

      setProgress(20);
      
      // Valider les valeurs des propriétés avant soumission
      if (Object.keys(propertyValues).length > 0) {
        try {
          const validationResponse = await axios.post(`${API_BASE_URL}/api/config/validate-property-values`, {
            propertyValues: propertyValues
          });
          
          const validationErrors = [];
          const missingRequired = [];
          
          Object.keys(validationResponse.data.validation).forEach(propName => {
            const validation = validationResponse.data.validation[propName];
            if (!validation.valid) {
              validationErrors.push(`${propName}: ${validation.error}`);
            }
            
            // Check required properties
            const prop = availableProperties.find(p => p.name === propName);
            if (prop && prop.required && (!propertyValues[propName] || propertyValues[propName] === '')) {
              missingRequired.push(propName);
            }
          });
          
          if (missingRequired.length > 0) {
            setProgress(0);
            setLoading(false);
            return {
              success: false,
              error: `Required properties missing: ${missingRequired.join(', ')}`
            };
          }
          
          if (validationErrors.length > 0) {
            setProgress(0);
            setLoading(false);
            return {
              success: false,
              error: `Validation errors: ${validationErrors.join('; ')}`
            };
          }
        } catch (err) {
          // Continue if validation endpoint fails (shouldn't block submission)
          console.warn('Property validation failed:', err);
        }
      }

      setProgress(40);

      // Filtrer les valeurs des propriétés
      const filledProperties = {};
      Object.keys(propertyValues).forEach(propName => {
        if (propertyValues[propName] && propertyValues[propName].toString().trim()) {
          filledProperties[propName] = propertyValues[propName];
        }
      });

      // Ajouter les champs dynamiques remplis
      dynamicFields.forEach(field => {
        if (field.name && field.value && field.value.toString().trim()) {
          filledProperties[field.name] = field.value;
        }
      });

      setProgress(60);

      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        content,
        date,
        additionalProperties: filledProperties,
      });

      setProgress(90);

      // Vérifier s'il y a des propriétés manquantes dans la réponse
      if (response.data.missingProperties && response.data.missingProperties.length > 0) {
        setMissingProperties(response.data.missingProperties);
        setProgress(100);
        return {
          success: false,
          error: i18n.t('chat.missingProperties') + ' ' + response.data.missingProperties.join(', '),
          missingProperties: response.data.missingProperties
        };
      }

      setProgress(100);
      return {
        success: true,
        message: response.data.message,
        missingProperties: []
      };
    } catch (err) {
      setProgress(0);
      const errorMessage = err.response?.data?.error;
      return {
        success: false,
        error: translateBackendError(errorMessage)
      };
    } finally {
      setLoading(false);
    }
  };

  const resetProgress = () => {
    setProgress(0);
  };

  return {
    loading,
    progress,
    missingProperties,
    setMissingProperties,
    submitChat,
    resetProgress
  };
}

