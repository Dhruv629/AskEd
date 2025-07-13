import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from './Register';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('Register Component', () => {
  const mockOnRegister = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('handles form submission successfully', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        username: 'testuser'
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnRegister).toHaveBeenCalledWith('test-token', 'testuser');
    });
  });

  test('handles registration error', async () => {
    const mockError = {
      response: {
        data: 'Username already exists'
      }
    };
    axios.post.mockRejectedValue(mockError);

    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'existinguser' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  test('switches to login page', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.click(screen.getByText('Login here'));
    
    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  test('validates password match', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'differentpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  test('validates password length', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: '123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
  });

  test('renders with dark mode', () => {
    render(<Register onRegister={mockOnRegister} onSwitchToLogin={mockOnSwitchToLogin} darkMode={true} />);
    
    const container = screen.getByRole('heading', { name: 'Register' }).closest('div');
    expect(container).toHaveClass('bg-gray-800/90');
  });
}); 