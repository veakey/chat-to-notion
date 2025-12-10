# Chat to Notion - Frontend

React frontend with GlassUI design for the Chat to Notion application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create a `.env` file to configure the API URL:
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The app will run on http://localhost:3000

## Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Chat/          # Chat-related components
│   │   │   ├── ChatPage.js
│   │   │   ├── DynamicField.js
│   │   │   ├── DynamicFieldsSection.js
│   │   │   ├── ProgressBar.js
│   │   │   └── PropertyFieldsSection.js
│   │   ├── Config/        # Configuration components
│   │   │   ├── ConfigForm.js
│   │   │   └── PropertiesSection.js
│   │   ├── ConfigPage.js
│   │   ├── ChatPage.js
│   │   ├── LanguageSelector.js
│   │   ├── Toast.js
│   │   └── ToastContainer.js
│   ├── contexts/          # React contexts
│   │   └── ToastContext.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useChatForm.js
│   │   ├── useChatSubmission.js
│   │   ├── useConfig.js
│   │   └── useDynamicFields.js
│   ├── i18n/              # Internationalization
│   │   ├── config.js
│   │   └── README.md
│   ├── locales/            # Translation files
│   │   ├── fr/
│   │   ├── en/
│   │   ├── de/
│   │   └── it/
│   ├── utils/              # Utility functions
│   │   └── errorTranslator.js
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
└── package.json            # Node.js dependencies
```

## Features

- **GlassUI Design**: Modern glassmorphism UI with backdrop blur effects
- **Background Image**: Stunning background image
- **Configuration Page**: Easy setup of Notion API credentials
- **Chat Submission**: Simple interface to submit chat conversations to Notion
- **Dynamic Fields**: Support for custom Notion properties
- **Property Management**: Select and configure additional Notion properties
- **Internationalization**: Support for multiple languages (FR, EN, DE, IT)
- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: User feedback for actions and errors

## Internationalization

The frontend supports multiple languages using `react-i18next`. See [src/i18n/README.md](src/i18n/README.md) for detailed information.

Supported languages:
- 🇫🇷 French (default)
- 🇬🇧 English
- 🇩🇪 German
- 🇮🇹 Italian

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000
```

## Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm test -- --watch`: Run tests in watch mode
- `npm test -- --coverage`: Run tests with coverage

## Testing

See [src/__tests__/README.md](src/__tests__/README.md) for detailed testing information.

Run tests:
```bash
npm test
```

## Component Architecture

### Main Components

- **App.js**: Root component with routing and layout
- **ConfigPage.js**: Notion configuration interface
- **ChatPage.js**: Chat submission interface

### Sub-components

- **ConfigForm**: Form for entering Notion credentials
- **PropertiesSection**: Management of additional Notion properties
- **DynamicFieldsSection**: Dynamic field creation and management
- **PropertyFieldsSection**: Input fields for configured properties
- **ProgressBar**: Upload progress indicator
- **LanguageSelector**: Language switching component
- **Toast/ToastContainer**: Notification system

### Custom Hooks

- **useConfig**: Manages Notion configuration state
- **useChatForm**: Handles chat form state and property values
- **useChatSubmission**: Manages chat submission and validation
- **useDynamicFields**: Manages dynamic field creation and updates

## Styling

The application uses CSS with glassmorphism design principles:
- Backdrop blur effects
- Semi-transparent backgrounds
- Smooth transitions and animations
- Responsive breakpoints

## Production Deployment

- Build for production: `npm run build`
- Serve static files through a web server (nginx, Apache)
- Configure proper CORS policies
- Add input validation and sanitization
- Optimize images and assets
- Enable compression (gzip, brotli)

## Dependencies

See `package.json` for the complete list of dependencies.

Main dependencies:
- React 18: UI library
- react-i18next: Internationalization
- Axios: HTTP client
- react-scripts: Build tooling
