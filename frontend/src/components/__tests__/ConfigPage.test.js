import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import ConfigPage from '../ConfigPage';

const makeI18n = () =>
  i18n.createInstance().use(() => {}).init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          config: {
            title: 'Notion Configuration',
            add: 'Add configuration',
            list: 'Configurations',
            noConfig: 'No configuration yet.',
            select: 'Activate',
            active: 'Active',
            addConfig: 'Add configuration',
            editConfig: 'Edit configuration',
            apiKey: 'API key',
            databaseId: 'Database ID',
            label: 'Friendly name',
            labelPlaceholder: 'Friendly name',
            status: { configured: 'Configured', notConfigured: 'Not configured' },
            properties: { loading: 'Loading properties...' },
            instructions: { title: 'Instructions' },
          },
          common: { edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save', saving: 'Saving...' },
        },
      },
    },
  });

describe('ConfigPage list and selection', () => {
  const configs = [
    { id: 1, label: 'Alpha', databaseId: 'db1', isActive: false },
    { id: 2, label: 'Beta', databaseId: 'db2', isActive: true },
  ];

  it('shows configs and triggers select and delete', async () => {
    const onSelect = jest.fn();
    const onDelete = jest.fn().mockResolvedValue();
    const onAdd = jest.fn();
    const onUpdate = jest.fn();
    const onRefresh = jest.fn();
    const i18nInstance = makeI18n();

    render(
      <I18nextProvider i18n={i18nInstance}>
        <ConfigPage
          configs={configs}
          activeConfigId={2}
          onSelectConfig={onSelect}
          onRefreshConfigs={onRefresh}
          onAddConfig={onAdd}
          onUpdateConfig={onUpdate}
          onDeleteConfig={onDelete}
          loadingConfigs={false}
          initialLoading={false}
        />
      </I18nextProvider>
    );

    expect(screen.getByText(/Beta/)).toBeInTheDocument();
    const activateBtn = screen.getAllByText(/Activate/)[0];
    fireEvent.click(activateBtn);
    expect(onSelect).toHaveBeenCalled();

    const deleteBtns = screen.getAllByText(/Delete/);
    fireEvent.click(deleteBtns[0]);
    expect(onDelete).toHaveBeenCalled();
  });
});


