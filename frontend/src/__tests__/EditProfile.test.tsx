//Halema Diab
//Test for UC6 - Edit Profile
//maps to FR-08, FR-09, FR-25, FR-28


import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditProfile from '../pages/EditProfile';

// TC1 - Valid inputs saves successfully
test('TC1 - valid inputs shows success message', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('Your username'), { target: { value: 'Alex Morgan' } });
  fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'alex@email.com' } });
  fireEvent.click(screen.getByText('Save Changes'));
  expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
});

// TC2 - Empty username shows error
test('TC2 - empty username shows error', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('Your username'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Save Changes'));
  expect(screen.getByText('Username is required.')).toBeInTheDocument();
});

// TC3 - Invalid email shows error
test('TC3 - invalid email format shows error', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'notanemail' } });
  fireEvent.click(screen.getByText('Save Changes'));
  expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
});

// TC4 - Password too short shows error
test('TC4 - password under 12 characters shows error', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('••••••••••••'), { target: { value: 'abc123' } });
  fireEvent.click(screen.getByText('Save Changes'));
  expect(screen.getByText('Password must be at least 12 characters.')).toBeInTheDocument();
});

// TC5 - Cancel resets fields
test('TC5 - cancel resets fields to original values', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('Your username'), { target: { value: 'New Name' } });
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.getByPlaceholderText('Your username')).toHaveValue('Jane Doe');
});

// TC6 - Profile update reflects within 2 seconds
test('TC6 - profile update completes within 2 seconds', () => {
  render(<MemoryRouter><EditProfile /></MemoryRouter>);
  const start = performance.now();
  fireEvent.click(screen.getByText('Save Changes'));
  const end = performance.now();
  expect(end - start).toBeLessThan(2000);
});