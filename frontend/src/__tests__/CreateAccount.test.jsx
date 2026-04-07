import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '../Login';

describe('Create Account/User Insert', () => {
  const onLoginMock = vi.fn();
  let fetchSpy;

  beforeEach(() => {
    onLoginMock.mockClear();
    fetchSpy = vi.spyOn(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('Inserts a new user and confirms the record is stored correctly', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        message: "Registration successful",
        user: { userId: 4, name: 'New User', email: 'new@example.com', role: 'applicant' }
      }),
    });

    render(<Login onLogin={onLoginMock} />);

    fireEvent.click(screen.getByText('Create a new account?'));

    await waitFor(() => {
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });

    const registrationModal = screen.getByText('New User Registration').closest('.info-card');
    const withinRegistrationModal = within(registrationModal);

    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Full Name'), { target: { value: 'New User' } });
    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Email Address'), { target: { value: 'new@example.com' } });
    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Create Password'), { target: { value: 'password123' } });

    fireEvent.click(withinRegistrationModal.getByText('Create Account & Sign In'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
            role: 'applicant'
          }),
        })
      );
    });

    await waitFor(() => {
      expect(onLoginMock).toHaveBeenCalledWith({ userId: 4, name: 'New User', email: 'new@example.com', role: 'applicant' });
    });
  });
});
