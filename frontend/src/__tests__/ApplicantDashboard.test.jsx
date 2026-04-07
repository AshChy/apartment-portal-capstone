import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ApplicantDashboard from '../ApplicantDashboard';

describe('ApplicantDashboard application submission', () => {
  const mockCurrentUser = {
    userId: 1,
    name: 'Test Applicant',
    email: 'test@applicant.com',
    role: 'applicant',
  };

  let fetchSpy;
  let alertSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(window, 'fetch');
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock initial fetch calls for ApplicantDashboard
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]), // No existing applications
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { unitId: 101, unitNumber: 'A1', bedrooms: 2, rentAmount: 1500 },
        { unitId: 102, unitNumber: 'B2', bedrooms: 1, rentAmount: 1200 },
      ]), // Available units
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('successfully submits a new application', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        message: 'Application submitted successfully',
        applicationId: 123,
      }),
    });
    // Mock the subsequent fetchApplications call after submission
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{
        applicationId: 123,
        userId: mockCurrentUser.userId,
        unitId: 101,
        moveInDate: '2026-05-01',
        income: 50000,
        status: 'Pending',
        submissionDate: '2026-04-07',
        unitNumber: 'A1',
        bedrooms: 2,
        rentAmount: 1500,
      }]),
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]), // documents for the new application
    });


    render(<ApplicantDashboard currentUser={mockCurrentUser} onUserUpdate={() => {}} />);

    await waitFor(() => {
        expect(screen.getByText('Start Your Application')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '101' } });
    fireEvent.change(screen.getByLabelText(/desired move-in date/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByPlaceholderText('Annual Income'), { target: { value: '50000' } });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/applications',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockCurrentUser.userId,
            unitId: 101,
            moveInDate: '2026-05-01',
            income: 50000,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Application submitted successfully!');
    });

    // Ensure application details are displayed after submission and refresh
    await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: /Status:\s*Pending/i })).toBeInTheDocument();
        expect(screen.getByText('Application ID: #123')).toBeInTheDocument();
    });
  });

  it('shows an alert if application is submitted with incomplete data', async () => {
    render(<ApplicantDashboard currentUser={mockCurrentUser} onUserUpdate={() => {}} />);

    await waitFor(() => {
        expect(screen.getByText('Start Your Application')).toBeInTheDocument();
    });

    // Don't fill any fields
    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please select a unit, move-in date, and income.');
    });

    // Expect initial fetch calls, but not the application submission fetch
    expect(fetchSpy).toHaveBeenCalledTimes(2); // Initial applications and available units fetches
  });

  it('shows an alert on server error during application submission', async () => {
    // Mock the application submission to fail
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to process application on server' }),
    });
    // Mock subsequent fetchApplications if it's called
    fetchSpy.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });


    render(<ApplicantDashboard currentUser={mockCurrentUser} onUserUpdate={() => {}} />);

    await waitFor(() => {
        expect(screen.getByText('Start Your Application')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '101' } });
    fireEvent.change(screen.getByLabelText(/desired move-in date/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByPlaceholderText('Annual Income'), { target: { value: '50000' } });

    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/applications',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockCurrentUser.userId,
            unitId: 101,
            moveInDate: '2026-05-01',
            income: 50000,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to process application on server');
    });

    // Ensure fetchApplications is called even on error to refresh potential UI state
    // It should be 3 calls: initial applications, available units, then the failed application submit.
    // The previous mocks mean the current count would be 2 before the button click,
    // so it should be 3 after the failed attempt.
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
