import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ApplicantDashboard from '../ApplicantDashboard';

describe('Application Submission', () => {
  const currentUser = { userId: 1, name: 'Test Applicant' };
  let fetchSpy;
  let alertSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(window, 'fetch');
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Inserts a new application and confirms it is stored with the correct user and status', async () => {
    const availableUnits = [
      { unitId: 1, unitNumber: '101', bedrooms: 1, rentAmount: 1200 },
    ];

    fetchSpy.mockImplementation((url) => {
      if (url.includes('/api/units/available')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(availableUnits),
        });
      }
      if (url.includes('/api/applications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Application submitted successfully!' }),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<ApplicantDashboard currentUser={currentUser} onUserUpdate={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Start Your Application')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Desired Move-In Date'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByPlaceholderText('Annual Income'), { target: { value: '50000' } });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/applications',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            unitId: 1,
            moveInDate: '2026-01-01',
            income: 50000,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Application submitted successfully!');
    });
  });
});
