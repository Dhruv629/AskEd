import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Flashcards from './Flashcards';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

describe('Flashcards Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    mockAxios.get.mockResolvedValue({ data: [] });
    mockAxios.post.mockResolvedValue({ data: [] });
  });

  test('renders flashcard generator interface', () => {
    render(<Flashcards />);

    expect(screen.getByRole('heading', { name: 'Generate Flashcards' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My Saved Flashcards' })).toBeInTheDocument();
    expect(screen.getByLabelText('PDF Filename (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Flashcards' })).toBeInTheDocument();
  });

  test('handles text input', () => {
    render(<Flashcards />);

    const textInput = screen.getByLabelText('Text Content');
    fireEvent.change(textInput, { target: { value: 'Test content for flashcards' } });

    expect(textInput.value).toBe('Test content for flashcards');
  });

  test('handles filename input', () => {
    render(<Flashcards />);

    const filenameInput = screen.getByLabelText('PDF Filename (Optional)');
    fireEvent.change(filenameInput, { target: { value: 'test.pdf' } });

    expect(filenameInput.value).toBe('test.pdf');
  });

  test('generates flashcards from text', async () => {
    const mockFlashcards = [
      { question: 'What is React?', answer: 'A JavaScript library' },
      { question: 'What is JSX?', answer: 'A syntax extension for JavaScript' }
    ];
    
    mockAxios.post.mockResolvedValue({ data: mockFlashcards });

    render(<Flashcards />);

    const textInput = screen.getByLabelText('Text Content');
    fireEvent.change(textInput, { target: { value: 'React is a JavaScript library' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Flashcards' });
    
    await act(async () => {
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/ai/flashcards-from-text',
        { inputText: 'React is a JavaScript library' }
      );
    });
  });

  test('displays error message when generation fails', async () => {
    mockAxios.post.mockRejectedValue({ response: { data: 'Failed to generate flashcards' } });

    render(<Flashcards />);

    const textInput = screen.getByLabelText('Text Content');
    fireEvent.change(textInput, { target: { value: 'Test content' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Flashcards' });
    
    await act(async () => {
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to generate flashcards from text')).toBeInTheDocument();
    });
  });

  test('handles initial content prop', () => {
    const initialContent = 'React is a JavaScript library.';
    render(<Flashcards initialContent={initialContent} />);

    const textInput = screen.getByLabelText('Text Content');
    expect(textInput.value).toBe(initialContent);
  });

  test('handles initial filename prop', () => {
    const initialFilename = 'test.pdf';
    render(<Flashcards initialFilename={initialFilename} />);

    const filenameInput = screen.getByLabelText('PDF Filename (Optional)');
    expect(filenameInput.value).toBe(initialFilename);
  });

  test('shows loading state during generation', async () => {
    // Mock a delayed response
    mockAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));

    render(<Flashcards />);

    const textInput = screen.getByLabelText('Text Content');
    fireEvent.change(textInput, { target: { value: 'Test content' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Flashcards' });
    
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Button should be disabled during loading
    expect(generateButton).toBeDisabled();
  });

  test('has proper accessibility attributes', () => {
    render(<Flashcards />);

    // Check for proper form labels
    expect(screen.getByLabelText('PDF Filename (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();

    // Check for proper input attributes
    const filenameInput = screen.getByLabelText('PDF Filename (Optional)');
    const textInput = screen.getByLabelText('Text Content');

    expect(filenameInput).toHaveAttribute('type', 'text');
    expect(textInput).toHaveAttribute('rows', '4');
  });
}); 