import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboard from '../AdminDashboard';

describe('Application Status Update', () => {
  let fetchSpy;
  let alertSpy;

  const mockApplications = [
    {
      applicationId: 1,
      applicantName: 'John Doe',
      unitNumber: '101',
      status: 'Pending',
      applicantEmail: 'john.doe@example.com',
      moveInDate: '2026-01-15',
      income: 60000,
      unitId: 1,
    },
  ];

  beforeEach(() => {
    fetchSpy = vi.spyOn(window, 'fetch');
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('Updates application status and confirms the change is reflected', async () => {
    fetchSpy.mockImplementation((url) => {
      if (url.includes('/api/admin/applications/review-queue')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApplications),
        });
      }
      if (url.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Application approved successfully.' }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/admin/applications/1/status',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Approved' }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Application approved successfully.');
    });
  });
});
