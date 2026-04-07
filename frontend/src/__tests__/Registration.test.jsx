import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '../Login';

describe('Registration functionality in Login component', () => {
  const onLoginMock = vi.fn();
  let fetchSpy;
  let localStorageSetItemSpy;
  let alertSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    onLoginMock.mockClear();
    fetchSpy = vi.spyOn(window, 'fetch');
    localStorageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    localStorageSetItemSpy.mockRestore();
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore(); // Restore console.error
  });
  it('successfully registers a new user and calls onLogin', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        message: "Registration successful",
        user: { userId: 4, name: 'New User', email: 'new@example.com', role: 'applicant' }
      }),
    });

    render(<Login onLogin={onLoginMock} />);

    fireEvent.click(screen.getByText('Create a new account?'));

    // Wait for the registration form to appear
    await waitFor(() => {
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });

    const registrationModal = screen.getByText('New User Registration').closest('.info-card');
    const withinRegistrationModal = within(registrationModal);

    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Full Name'), { target: { value: 'New User' } });
    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Email Address'), { target: { value: 'new@example.com' } });
    fireEvent.change(withinRegistrationModal.getByPlaceholderText('Create Password'), { target: { value: 'password123' } });
    fireEvent.change(withinRegistrationModal.getByRole('combobox'), { target: { value: 'Applicant' } });

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
            role: 'applicant',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ userId: 4, name: 'New User', email: 'new@example.com', role: 'applicant' })
      );
    });

    await waitFor(() => {
      expect(onLoginMock).toHaveBeenCalledWith({ userId: 4, name: 'New User', email: 'new@example.com', role: 'applicant' });
    });

    // Assert that the registration form is no longer visible
    await waitFor(() => {
        expect(screen.queryByText('New User Registration')).not.toBeInTheDocument();
    });
  });

  it('shows an alert if registration is attempted with empty fields', async () => {
    render(<Login onLogin={onLoginMock} />);

    fireEvent.click(screen.getByText('Create a new account?'));

    await waitFor(() => {
      expect(screen.getByText('New User Registration')).toBeInTheDocument();
    });

    const registrationModal = screen.getByText('New User Registration').closest('.info-card');
    const withinRegistrationModal = within(registrationModal);
    // Don't fill any fields
    fireEvent.click(withinRegistrationModal.getByText('Create Account & Sign In'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please enter name, email, and password.');
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onLoginMock).not.toHaveBeenCalled();
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
  });

  it('shows an alert on server error during registration', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to create account due to server issue' }),
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
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to create account due to server issue');
    });

    expect(onLoginMock).not.toHaveBeenCalled();
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
  });

  it('shows an alert when unable to connect to server during registration', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error')); // Simulate network error

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
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Unable to connect to server');
    });

    expect(onLoginMock).not.toHaveBeenCalled();
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
  });
});