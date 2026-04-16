// Srinidhi Sivakaminathan
// Test Cases for UC8 - Rename Collection
// Maps to FR-18, FR-28, NFR-03

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import RenameCollection from '../components/RenameCollection';

const defaultProps = {
  currentName: 'Biology Chapter 1',
  onSave: jest.fn(),
  onCancel: jest.fn(),
  existingNames: ['Biology Chapter 1', 'Spanish Vocabulary'],
};

// Test Case 1: Valid collection name → renamed successfully
test('TC1 - valid collection name renames successfully', () => {
  const onSave = jest.fn();
  render(<RenameCollection {...defaultProps} onSave={onSave} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByText('Save'));
  expect(onSave).toHaveBeenCalledWith('Biology Chapter 1 New');
});

// Test Case 2: Special characters only → error
test('TC2 - special characters only shows invalid error', () => {
  render(<RenameCollection {...defaultProps} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '!@#$%^&*()' } });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText('Invalid Collection Name.')).toBeInTheDocument();
});

// Test Case 3: Empty field → error
test('TC3 - empty field shows incomplete field error', () => {
  render(<RenameCollection {...defaultProps} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText('Incomplete Field.')).toBeInTheDocument();
});

// Test Case 4: Valid name → renamed within 500ms (NFR-03)
test('TC4 - rename completes within 500ms', () => {
  const onSave = jest.fn();
  render(<RenameCollection {...defaultProps} onSave={onSave} />);
  const start = performance.now();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByText('Save'));
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});

// Test Case 5: Valid name → onSave called (name visible in list)
test('TC5 - onSave is called with updated name', () => {
  const onSave = jest.fn();
  render(<RenameCollection {...defaultProps} onSave={onSave} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Biology Chapter 1 New' } });
  fireEvent.click(screen.getByText('Save'));
  expect(onSave).toHaveBeenCalledWith('Biology Chapter 1 New');
});

// Test Case 6: Duplicate name → error
test('TC6 - duplicate collection name shows error', () => {
  render(<RenameCollection {...defaultProps} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Spanish Vocabulary' } });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText('Collection Name already exists')).toBeInTheDocument();
});

// Test Case 7: Blank spaces only → error
test('TC7 - blank spaces only shows invalid error', () => {
  render(<RenameCollection {...defaultProps} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText('Incomplete Field.')).toBeInTheDocument();
});