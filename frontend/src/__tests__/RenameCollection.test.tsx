// Srinidhi Sivakaminathan
// Test Cases for UC8 - Rename Collection
// Maps to FR-18, FR-28, NFR-03

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import RenameCollection from '../pages/RenameCollection';

// Test Case 1: Valid collection name → renamed successfully
test('TC1 - valid collection name renames successfully', () => {
  const onRename = jest.fn();
  render(<RenameCollection onRename={onRename} />);
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('success-msg')).toHaveTextContent('Collection Renamed Successfully.');
});

// Test Case 2: Special characters only → error
test('TC2 - special characters only shows invalid error', () => {
  render(<RenameCollection onRename={jest.fn()} />);
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: '!@#$%^&*()' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('Invalid Collection Name.');
});

// Test Case 3: Empty field → error
test('TC3 - empty field shows incomplete field error', () => {
  render(<RenameCollection onRename={jest.fn()} />);
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('Incomplete Field.');
});

// Test Case 4: Valid name → renamed within 500ms (NFR-03)
test('TC4 - rename completes within 500ms', () => {
  const onRename = jest.fn();
  render(<RenameCollection onRename={onRename} />);
  const start = performance.now();
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});

// Test Case 5: Valid name → success message visible in UI
test('TC5 - success message visible after rename', () => {
  render(<RenameCollection onRename={jest.fn()} />);
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('success-msg')).toBeInTheDocument();
});

// Test Case 6: Duplicate name → error
test('TC6 - duplicate collection name shows error', () => {
  render(<RenameCollection onRename={jest.fn()} />);
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: 'Biology Chapter 1' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('Collection Name already exists');
});

// Test Case 7: Blank spaces only → error
test('TC7 - blank spaces only shows invalid error', () => {
  render(<RenameCollection onRename={jest.fn()} />);
  fireEvent.change(screen.getByTestId('rename-input'), { target: { value: '   ' } });
  fireEvent.click(screen.getByTestId('save-btn'));
  expect(screen.getByTestId('error-msg')).toHaveTextContent('Invalid Collection Name.');
});