import i18n from '../i18n/config';

/**
 * Traduit les messages d'erreur du backend
 */
export const translateBackendError = (errorMessage) => {
  if (!errorMessage) {
    return i18n.t('errors.contentRequired');
  }

  const errorLower = errorMessage.toLowerCase();
  
  // Mapping des messages d'erreur du backend vers les clés de traduction
  if (errorLower.includes('n\'est pas configuré') || errorLower.includes('not configured') || errorLower.includes('notion n\'est pas')) {
    return i18n.t('errors.notionNotConfigured');
  }
  
  if (errorLower.includes('requis') || errorLower.includes('required')) {
    if (errorLower.includes('contenu') || errorLower.includes('content')) {
      return i18n.t('errors.contentRequired');
    }
    if (errorLower.includes('code secret') || errorLower.includes('api key') || errorLower.includes('database id')) {
      return i18n.t('errors.apiKeyRequired');
    }
  }
  
  if (errorLower.includes('identifiants invalides') || errorLower.includes('invalid credentials')) {
    // Extraire le message d'erreur détaillé si disponible
    const match = errorMessage.match(/Identifiants Notion invalides : (.+)/i);
    if (match) {
      return i18n.t('errors.invalidCredentials', { error: match[1] });
    }
    return i18n.t('errors.invalidCredentials', { error: errorMessage });
  }
  
  if (errorLower.includes('aucune propriété') || errorLower.includes('no property') || errorLower.includes('title')) {
    return i18n.t('errors.noTitleProperty');
  }
  
  if (errorLower.includes('détection des propriétés') || errorLower.includes('property detection')) {
    const match = errorMessage.match(/Erreur lors de la détection des propriétés : (.+)/i);
    if (match) {
      return i18n.t('errors.propertyDetectionError', { error: match[1] });
    }
    return i18n.t('errors.propertyDetectionError', { error: errorMessage });
  }
  
  // Si aucun mapping trouvé, retourner le message original
  return errorMessage;
};

