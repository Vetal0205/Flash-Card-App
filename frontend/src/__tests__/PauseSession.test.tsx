// Srinidhi Sivakaminathan
// Test Cases for UC9 - Pause Study Session
// Maps to FR-19, FR-28, NFR-05, NFR-06

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PauseSession from '../pages/StudyMode';

// Test Case 1: User clicks pause during active session → paused successfully
test('TC1 - clicking pause during active session pauses successfully', () => {
  render(<PauseSession sessionActive={true} />);
  fireEvent.click(screen.getByTestId('pause-btn'));
  expect(screen.getByTestId('paused-indicator')).toHaveTextContent('Session paused');
});

// Test Case 2: User clicks pause when no active session exists → error
test('TC2 - clicking pause with no active session shows error', () => {
  render(<PauseSession sessionActive={false} />);
  fireEvent.click(screen.getByTestId('pause-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('No active session found');
});

// Test Case 3: User clicks pause when session already paused → error
test('TC3 - clicking pause on already paused session shows error', () => {
  render(<PauseSession sessionActive={true} />);
  fireEvent.click(screen.getByTestId('pause-btn'));
  fireEvent.click(screen.getByTestId('pause-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('Unable to Pause session.');
});

// Test Case 4: Pause completes within 500ms (NFR-05)
test('TC4 - pause completes within 500ms', () => {
  render(<PauseSession sessionActive={true} />);
  const start = performance.now();
  fireEvent.click(screen.getByTestId('pause-btn'));
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});

// Test Case 5: Session state updates to paused in UI
test('TC5 - session state shows as paused in UI after pause', () => {
  render(<PauseSession sessionActive={true} />);
  fireEvent.click(screen.getByTestId('pause-btn'));
  expect(screen.getByTestId('paused-indicator')).toBeInTheDocument();
});