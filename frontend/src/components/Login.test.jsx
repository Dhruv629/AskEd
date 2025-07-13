import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('handles form submission successfully', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        username: 'testuser'
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(mockOnLogin).toHaveBeenCalledWith('test-token', 'testuser');
    });
  });

  test('handles login error', async () => {
    const mockError = {
      response: {
        data: 'Invalid credentials'
      }
    };
    axios.post.mockRejectedValue(mockError);

    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  test('switches to register page', () => {
    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    fireEvent.click(screen.getByText('Register here'));
    
    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });

  test('renders with dark mode', () => {
    render(<Login onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} darkMode={true} />);
    
    const container = screen.getByText('Login').closest('div');
    expect(container).toHaveClass('bg-gray-800/90');
  });
}); 