# Guide d'internationalisation (i18n)

Ce projet utilise `react-i18next` pour gérer les traductions multilingues.

## Structure

```
src/
├── i18n/
│   ├── config.js          # Configuration i18next
│   └── README.md          # Ce fichier
└── locales/
    ├── fr/
    │   └── translation.json  # Traductions françaises
    └── en/
        └── translation.json  # Traductions anglaises
```

## Ajouter une nouvelle langue

### 1. Créer le fichier de traduction

Créez un nouveau dossier dans `src/locales/` avec le code de langue (ex: `es` pour l'espagnol, `de` pour l'allemand) :

```bash
mkdir -p src/locales/es
```

### 2. Créer le fichier translation.json

Copiez le contenu de `src/locales/en/translation.json` et traduisez toutes les valeurs (gardez les clés identiques) :

```json
{
  "app": {
    "title": "Chat a Notion",
    "subtitle": "Envía tus conversaciones de chat a Notion con facilidad",
    ...
  }
}
```

### 3. Enregistrer la langue dans config.js

Ajoutez l'import et la ressource dans `src/i18n/config.js` :

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
        translation: translationES  // Ajoutez cette ligne
      }
    },
    // ...
  });
```

### 4. Ajouter au sélecteur de langue

Modifiez `src/components/LanguageSelector.js` pour ajouter l'option :

```javascript
<select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
  <option value="fr">🇫🇷 Français</option>
  <option value="en">🇬🇧 English</option>
  <option value="es">🇪🇸 Español</option>  {/* Ajoutez cette ligne */}
</select>
```

### 5. Mettre à jour la détection automatique

Modifiez la fonction `getInitialLanguage()` dans `src/i18n/config.js` pour détecter la nouvelle langue :

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
  if (browserLanguage.startsWith('es')) {  // Ajoutez cette condition
    return 'es';
  }
  return 'en';
};
```

## Utilisation dans les composants

### Hook useTranslation

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('app.title')}</h1>;
}
```

### Interpolation de variables

```javascript
// Dans translation.json
{
  "greeting": "Bonjour {{name}}"
}

// Dans le composant
{t('greeting', { name: 'John' })}
```

### Composants React dans les traductions

Utilisez le composant `Trans` pour inclure des éléments React :

```javascript
import { Trans } from 'react-i18next';

// Dans translation.json
{
  "link": "Visitez notre <link>site web</link>"
}

// Dans le composant
<Trans
  i18nKey="link"
  components={{
    link: <a href="https://example.com" />
  }}
/>
```

## Traduire les messages d'erreur du backend

Les messages d'erreur du backend sont traduits automatiquement via `src/utils/errorTranslator.js`. 

Pour ajouter la traduction d'un nouveau message d'erreur :

1. Ajoutez la clé dans les fichiers de traduction (`errors.newError`)
2. Ajoutez le mapping dans `errorTranslator.js`

## Bonnes pratiques

1. **Toujours utiliser des clés descriptives** : `chat.form.submit` plutôt que `submit`
2. **Grouper par contexte** : `config.form.apiKeyLabel` plutôt que `apiKeyLabel`
3. **Éviter les traductions hardcodées** : Utilisez toujours `t()` même pour les textes courts
4. **Tester toutes les langues** : Vérifiez que toutes les traductions s'affichent correctement
5. **Garder les clés synchronisées** : Tous les fichiers de traduction doivent avoir les mêmes clés

## Langues supportées

- 🇫🇷 Français (fr) - Langue par défaut
- 🇬🇧 English (en)
- 🇪🇸 Español (es) - À venir
- 🇩🇪 Deutsch (de) - À venir

