// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock i18next pour les tests
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (key, params) => {
        // Retourner la clé ou une traduction simple pour les tests
        const translations = {
          'chat.title': 'Envoyer un chat vers Notion',
          'chat.form.dateLabel': 'Date du chat',
          'chat.form.contentLabel': 'Contenu du chat',
          'chat.notConfigured': "⚠️ Veuillez d'abord configurer vos identifiants Notion dans l'onglet Configuration",
          'app.title': 'Chat vers Notion',
          'app.subtitle': 'Envoyez vos conversations de chat vers Notion en toute simplicité',
          'app.loading': 'Chargement...',
          'app.tabs.chat': '📝 Envoyer un chat',
          'app.tabs.config': '⚙️ Configuration'
        };
        let translation = translations[key] || key;
        // Remplacer les paramètres si présents
        if (params) {
          Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
          });
        }
        return translation;
      },
      i18n: {
        changeLanguage: jest.fn(),
        language: 'fr'
      }
    };
  },
  Trans: ({ i18nKey, children, components }) => {
    if (children) return children;
    if (components) {
      // Simuler le rendu avec composants
      return i18nKey;
    }
    return i18nKey;
  }
}));

