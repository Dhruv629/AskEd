import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

// Mock axios
jest.mock('axios');

describe('Home Component', () => {
  const mockOnNavigateToSummarizer = jest.fn();
  const mockOnNavigateToFlashcards = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders home interface', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    expect(screen.getByRole('heading', { name: 'Welcome to AskEd AI' })).toBeInTheDocument();
    expect(screen.getByText('Upload a PDF or add text, then choose what you\'d like to generate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Text' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload PDF' })).toBeInTheDocument();
  });

  test('switches between text and PDF input methods', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    // Initially text input should be visible
    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();

    // Click PDF upload button
    const pdfButton = screen.getByRole('button', { name: 'Upload PDF' });
    fireEvent.click(pdfButton);

    // PDF upload should now be visible
    expect(screen.getByLabelText('Upload PDF')).toBeInTheDocument();
  });

  test('handles text input', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    const textArea = screen.getByLabelText('Text Content');
    fireEvent.change(textArea, { target: { value: 'Test content' } });

    expect(textArea.value).toBe('Test content');
  });

  test('generates summary when text is provided', async () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    const textArea = screen.getByLabelText('Text Content');
    fireEvent.change(textArea, { target: { value: 'Test content' } });

    const summaryButton = screen.getByRole('button', { name: '📝 Generate Summary' });
    
    await act(async () => {
      fireEvent.click(summaryButton);
    });

    expect(mockOnNavigateToSummarizer).toHaveBeenCalledWith('Test content');
  });

  test('generates flashcards when text is provided', async () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    const textArea = screen.getByLabelText('Text Content');
    fireEvent.change(textArea, { target: { value: 'Test content' } });

    const flashcardsButton = screen.getByRole('button', { name: '🎯 Generate Flashcards' });
    
    await act(async () => {
      fireEvent.click(flashcardsButton);
    });

    expect(mockOnNavigateToFlashcards).toHaveBeenCalledWith('Test content', null);
  });

  test('disables buttons when no content is provided', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    const summaryButton = screen.getByRole('button', { name: '📝 Generate Summary' });
    const flashcardsButton = screen.getByRole('button', { name: '🎯 Generate Flashcards' });

    expect(summaryButton).toBeDisabled();
    expect(flashcardsButton).toBeDisabled();
  });

  test('enables buttons when content is provided', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    const textArea = screen.getByLabelText('Text Content');
    fireEvent.change(textArea, { target: { value: 'Test content' } });

    const summaryButton = screen.getByRole('button', { name: '📝 Generate Summary' });
    const flashcardsButton = screen.getByRole('button', { name: '🎯 Generate Flashcards' });

    expect(summaryButton).not.toBeDisabled();
    expect(flashcardsButton).not.toBeDisabled();
  });

  test('has proper accessibility attributes', () => {
    render(
      <Home 
        onNavigateToSummarizer={mockOnNavigateToSummarizer}
        onNavigateToFlashcards={mockOnNavigateToFlashcards}
      />
    );

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check for form labels
    expect(screen.getByLabelText('Text Content')).toBeInTheDocument();
    
    // Check that buttons are accessible
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
}); 