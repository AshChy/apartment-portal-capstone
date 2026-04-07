import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard application status update', () => {
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
    {
      applicationId: 2,
      applicantName: 'Jane Smith',
      unitNumber: '102',
      status: 'Pending',
      applicantEmail: 'jane.smith@example.com',
      moveInDate: '2026-02-15',
      income: 70000,
      unitId: 2,
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

  it('updates application status for approve and reject', async () => {
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
          json: () => Promise.resolve({ message: 'Status updated successfully.' }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const approveButton = screen.getAllByRole('button', { name: 'Approve' })[0];
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/admin/applications/1/status',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'Approved' }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Application approved successfully.');
    });

    const rejectButton = screen.getAllByRole('button', { name: 'Reject' })[1];
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/admin/applications/2/status',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'Rejected' }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Application rejected successfully.');
    });
  });
});
