# Internationalization (i18n) Guide

This project uses `react-i18next` to manage multilingual translations.

## Structure

```
src/
├── i18n/
│   ├── config.js          # i18next configuration
│   └── README.md          # This file
└── locales/
    ├── fr/
    │   └── translation.json  # French translations
    ├── en/
    │   └── translation.json  # English translations
    ├── de/
    │   └── translation.json  # German translations
    └── it/
        └── translation.json  # Italian translations
```

## Adding a New Language

### 1. Create the Translation File

Create a new folder in `src/locales/` with the language code (e.g., `es` for Spanish, `pt` for Portuguese):

```bash
mkdir -p src/locales/es
```

### 2. Create the translation.json File

Copy the content from `src/locales/en/translation.json` and translate all values (keep the keys identical):

```json
{
  "app": {
    "title": "Chat a Notion",
    "subtitle": "Envía tus conversaciones de chat a Notion con facilidad",
    ...
  }
}
```

### 3. Register the Language in config.js

Add the import and resource in `src/i18n/config.js`:

```javascript
import translationES from '../locales/es/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: translationFR
      },
      en: {
        translation: translationEN
      },
      es: {
        translation: translationES  // Add this line
      }
    },
    // ...
  });
```

### 4. Add to Language Selector

Modify `src/components/LanguageSelector.js` to add the option:

```javascript
<select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
  <option value="fr">🇫🇷 Français</option>
  <option value="en">🇬🇧 English</option>
  <option value="es">🇪🇸 Español</option>  {/* Add this line */}
</select>
```

### 5. Update Automatic Detection

Modify the `getInitialLanguage()` function in `src/i18n/config.js` to detect the new language:

```javascript
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  const browserLanguage = navigator.language || navigator.userLanguage;
  if (browserLanguage.startsWith('fr')) {
    return 'fr';
  }
  if (browserLanguage.startsWith('es')) {  // Add this condition
    return 'es';
  }
  return 'en';
};
```

## Usage in Components

### useTranslation Hook

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('app.title')}</h1>;
}
```

### Variable Interpolation

```javascript
// In translation.json
{
  "greeting": "Hello {{name}}"
}

// In component
{t('greeting', { name: 'John' })}
```

### React Components in Translations

Use the `Trans` component to include React elements:

```javascript
import { Trans } from 'react-i18next';

// In translation.json
{
  "link": "Visit our <link>website</link>"
}

// In component
<Trans
  i18nKey="link"
  components={{
    link: <a href="https://example.com" />
  }}
/>
```

## Translating Backend Error Messages

Backend error messages are automatically translated via `src/utils/errorTranslator.js`.

To add translation for a new error message:

1. Add the key in translation files (`errors.newError`)
2. Add the mapping in `errorTranslator.js`

## Best Practices

1. **Always use descriptive keys**: `chat.form.submit` rather than `submit`
2. **Group by context**: `config.form.apiKeyLabel` rather than `apiKeyLabel`
3. **Avoid hardcoded translations**: Always use `t()` even for short texts
4. **Test all languages**: Verify that all translations display correctly
5. **Keep keys synchronized**: All translation files must have the same keys

## Supported Languages

- 🇫🇷 Français (fr) - Default language
- 🇬🇧 English (en)
- 🇩🇪 Deutsch (de)
- 🇮🇹 Italiano (it)
