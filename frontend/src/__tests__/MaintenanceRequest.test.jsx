import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ResidentDashboard from '../ResidentDashboard';

describe('Maintenance Request Insert', () => {
  const currentUser = { userId: 1, name: 'Test Resident' };
  let fetchSpy;
  let promptSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(window, 'fetch');
    promptSpy = vi.spyOn(window, 'prompt');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    promptSpy.mockRestore();
  });

  it('Inserts a maintenance request and confirms it is stored with the correct user and details', async () => {
    promptSpy.mockReturnValue('Leaky faucet');

    fetchSpy.mockImplementation((url) => {
      if (url.includes('/api/maintenance/maintenance-request')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Request submitted' }),
        });
      }
      // Mock other fetches to avoid errors
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<ResidentDashboard currentUser={currentUser} />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome, Test Resident - Unit')).toBeInTheDocument();
    });

    const newRequestButton = screen.getByText('+ New Request');
    fireEvent.click(newRequestButton);

    await waitFor(() => {
      expect(promptSpy).toHaveBeenCalledWith('What is the maintenance issue?');
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/maintenance/maintenance-request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'General',
            description: 'Leaky faucet',
            userId: 1,
          }),
        })
      );
    });
  });
});
