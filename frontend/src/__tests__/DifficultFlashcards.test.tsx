//Halema Diab
//Test for UC7 - Difficult flashcards
//maps to FR-06, FR-11, FR-16, FR-17

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DifficultFlashcards from '../pages/DifficultFlashcards';

// TC1 - Difficult cards are displayed
test('TC1 - difficult flashcards are displayed', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  expect(screen.getByText('What is the nucleus?')).toBeInTheDocument();
});

// TC2 - Card flips to show answer
test('TC2 - clicking card flips to show answer', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  fireEvent.click(screen.getByText('What is the nucleus?'));
  expect(screen.getByText('Controls cell activities')).toBeInTheDocument();
});

// TC3 - Next button shows next card
test('TC3 - next button navigates to next card', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  fireEvent.click(screen.getByText('Next →'));
  expect(screen.getByText('Define osmosis')).toBeInTheDocument();
});

// TC4 - Previous button is disabled on first card
test('TC4 - previous button is disabled on first card', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  expect(screen.getByText('← Previous')).toBeDisabled();
});

// TC5 - Next button is disabled on last card
test('TC5 - next button is disabled on last card', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  fireEvent.click(screen.getByText('Next →'));
  fireEvent.click(screen.getByText('Next →'));
  fireEvent.click(screen.getByText('Next →'));
  expect(screen.getByText('Next →')).toBeDisabled();
});

// TC6 - Navigation completes within 0.5 seconds
test('TC6 - navigation between cards completes within 0.5 seconds', () => {
  render(<MemoryRouter><DifficultFlashcards /></MemoryRouter>);
  const start = performance.now();
  fireEvent.click(screen.getByText('Next →'));
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});