import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';

jest.mock('@/components/PropertyListingsClient', () => ({
  __esModule: true,
  default: ({ initialProperties }) => <div data-testid="plc-count">{initialProperties.length} properties</div>,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: '1' }, { id: '2' }]) })
) as jest.Mock;

describe('HomePage', () => {
  it('fetches properties and passes them to PropertyListingsClient', async () => {
    const ui = await HomePage();
    render(ui as React.ReactElement);

    await waitFor(() => {
      expect(screen.getByTestId('plc-count')).toHaveTextContent('2 properties');
    });
  });

  it('falls back to empty list on fetch failure', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false }));
    const ui = await HomePage();
    render(ui as React.ReactElement);

    await waitFor(() => {
      expect(screen.getByTestId('plc-count')).toHaveTextContent('0 properties');
    });
  });
}); 