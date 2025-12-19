import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import ChatPage from '../ChatPage';

const makeI18n = () =>
  i18n.createInstance().use(() => {}).init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          chat: {
            title: 'Send a chat to Notion',
            selectConfig: 'Select a configuration',
            activeConfig: 'Active database',
            notConfigured: 'Please configure your Notion credentials',
            form: { dateLabel: 'Date', contentLabel: 'Content', submit: 'Send' },
            dynamicFields: { maxReached: 'max' },
          },
          errors: { notConfigured: 'not configured' },
        },
      },
    },
  });

describe('ChatPage multi-config select', () => {
  const configs = [
    { id: 1, label: 'Alpha', databaseTitle: 'DB Alpha', databaseId: 'db1', isActive: false },
    { id: 2, label: 'Beta', databaseTitle: 'DB Beta', databaseId: 'db2', isActive: true },
  ];

  it('renders select with active config and triggers onSelect', () => {
    const onSelect = jest.fn();
    const i18nInstance = makeI18n();

    render(
      <I18nextProvider i18n={i18nInstance}>
        <ChatPage
          isConfigured
          activeConfig={configs[1]}
          configs={configs}
          onSelectConfig={onSelect}
        />
      </I18nextProvider>
    );

    const select = screen.getByLabelText(/Select a configuration/i);
    expect(select.value).toBe('2');
    fireEvent.change(select, { target: { value: '1' } });
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});


