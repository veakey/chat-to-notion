/**
 * Tests pour le composant ChatPage
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatPage from '../../components/ChatPage';
import { ToastProvider } from '../../contexts/ToastContext';

// Mock des hooks
jest.mock('../../hooks/useChatForm', () => ({
  useChatForm: () => ({
    content: '',
    setContent: jest.fn(),
    date: '2024-01-15',
    setDate: jest.fn(),
    availableProperties: [],
    selectedProperties: {},
    propertyValues: {},
    handlePropertyChange: jest.fn(),
    resetForm: jest.fn()
  })
}));

jest.mock('../../hooks/useDynamicFields', () => ({
  useDynamicFields: () => ({
    dynamicFields: [],
    missingProperties: [],
    setMissingProperties: jest.fn(),
    addDynamicField: jest.fn(() => true),
    removeDynamicField: jest.fn(),
    updateDynamicField: jest.fn(),
    resetDynamicFieldsValues: jest.fn()
  })
}));

jest.mock('../../hooks/useChatSubmission', () => ({
  useChatSubmission: () => ({
    loading: false,
    progress: 0,
    submitChat: jest.fn(() => Promise.resolve({ success: true, message: 'Success' })),
    resetProgress: jest.fn()
  })
}));

const renderWithProvider = (component) => {
  return render(
    <ToastProvider>
      {component}
    </ToastProvider>
  );
};

describe('ChatPage', () => {
  it('should render the form', () => {
    renderWithProvider(<ChatPage isConfigured={true} />);
    
    expect(screen.getByText('Envoyer un chat vers Notion')).toBeInTheDocument();
    expect(screen.getByLabelText('Date du chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Contenu du chat')).toBeInTheDocument();
  });

  it('should show warning when not configured', () => {
    renderWithProvider(<ChatPage isConfigured={false} />);
    
    expect(screen.getByText(/Veuillez d'abord configurer/)).toBeInTheDocument();
  });
});

