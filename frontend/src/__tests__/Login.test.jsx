import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '../Login';

describe('Login component', () => {
  it('renders the login form by default', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows an error message if login is attempted with empty fields', () => {
    render(<Login onLogin={() => {}} />);
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
  });

  it('shows the registration form when "Create a new account?" is clicked', () => {
    render(<Login onLogin={() => {}} />);
    fireEvent.click(screen.getByText('Create a new account?'));
    expect(screen.getByText('New User Registration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
  });

  it('calls the onLogin function with user data for dev admin login', () => {
    const handleLogin = vi.fn();
    render(<Login onLogin={handleLogin} />);
    fireEvent.click(screen.getByText('View Admin'));
    expect(handleLogin).toHaveBeenCalledWith({
      userId: 1,
      name: 'jaden',
      email: 'jaden@apartment.test',
      role: 'admin',
    });
  });
});
