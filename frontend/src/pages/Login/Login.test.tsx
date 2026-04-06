// Developer: Aaliyan
// Use Case: UC1
// Test Cases: UC1-F-1, UC1-F-7

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import MockPage from '../MockPage';
import { loginRequest } from '../../services/authApi';
import { LOCKOUT_MESSAGE } from '../../services/loginLockout';

jest.mock('../../services/authApi');

const mockedLogin = loginRequest as jest.MockedFunction<typeof loginRequest>;

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<div>Register</div>} />
        <Route path="/mock" element={<MockPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Use Case 1 – User Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('UC1-F-1: valid credentials grant access and redirect to landing page', async () => {
    mockedLogin.mockResolvedValue({ ok: true, token: 'jwt' });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email or username/i), 'alice');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
    expect(mockedLogin).toHaveBeenCalledWith('alice', 'ValidPass123');
  });

  test('UC1-F-7: three failed logins within 60 minutes lock account and show lockout message', async () => {
    mockedLogin.mockResolvedValue({
      ok: false,
      error: 'Could not authenticate',
    });

    renderLogin();

    for (let i = 0; i < 3; i++) {
      await userEvent.type(screen.getByLabelText(/email or username/i), 'bob');
      await userEvent.type(
        screen.getByLabelText(/^password$/i),
        `wrong${i}`
      );
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
      if (i < 2) {
        await waitFor(() => {
          expect(screen.getByRole('alert')).toHaveTextContent(
            'Could not authenticate'
          );
        });
        await userEvent.clear(screen.getByLabelText(/email or username/i));
        await userEvent.clear(screen.getByLabelText(/^password$/i));
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(LOCKOUT_MESSAGE);
    });
    expect(mockedLogin).toHaveBeenCalledTimes(3);
  });
});
