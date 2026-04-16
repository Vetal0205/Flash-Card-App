// Srinidhi Sivakaminathan
// Test Cases for UC9 - Pause Study Session
// Maps to FR-19, FR-28, NFR-05, NFR-06

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PauseSession from '../components/PauseSession';

const defaultProps = {
  deckName: 'Spanish Vocabulary',
  currentCard: 1,
  totalCards: 4,
  onResume: jest.fn(),
  onDashboard: jest.fn(),
};

// Test Case 1: Pause session renders with session paused message
test('TC1 - pause session displays session paused successfully', () => {
  render(<PauseSession {...defaultProps} />);
  expect(screen.getByText('Study session paused')).toBeInTheDocument();
});

// Test Case 2: Progress saved message displayed
test('TC2 - progress has been saved message is displayed', () => {
  render(<PauseSession {...defaultProps} />);
  expect(screen.getByText('Your progress has been saved')).toBeInTheDocument();
});

// Test Case 3: Session already paused - resume button visible
test('TC3 - resume button is visible when session is paused', () => {
  render(<PauseSession {...defaultProps} />);
  expect(screen.getByText('Resume Session')).toBeInTheDocument();
});

// Test Case 4: Pause completes within 500ms (NFR-05)
test('TC4 - pause session renders within 500ms', () => {
  const start = performance.now();
  render(<PauseSession {...defaultProps} />);
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});

// Test Case 5: Session state shows as paused in UI
test('TC5 - session state shows paused in UI', () => {
  render(<PauseSession {...defaultProps} />);
  expect(screen.getByText('Study session paused')).toBeInTheDocument();
  expect(screen.getByText('Progress: 1/4 cards')).toBeInTheDocument();
});