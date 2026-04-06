// Developer: Aaliyan
// Use Case: UC2
// Test Cases: UC2-F-1, UC2-F-2

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Register from './Register';
import { registerRequest } from '../../services/authApi';
import { PASSWORD_RULES_ERROR } from '../../services/passwordRules';

jest.mock('../../services/authApi');

const mockedRegister = registerRequest as jest.MockedFunction<
  typeof registerRequest
>;

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route
          path="/"
          element={
            <h1 data-testid="login-destination">Welcome back</h1>
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Use Case 2 – New User Sign-Up', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UC2-F-1: unique username and valid password create account and redirect to login page', async () => {
    mockedRegister.mockResolvedValue({ ok: true });

    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Aaliyan User');
    await userEvent.type(
      screen.getByLabelText(/email or username/i),
      'aaliyan_new'
    );
    await userEvent.type(
      screen.getByLabelText(/^password$/i),
      'ValidPass12345'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-destination')).toBeInTheDocument();
    });
    expect(mockedRegister).toHaveBeenCalledWith({
      fullName: 'Aaliyan User',
      username: 'aaliyan_new',
      password: 'ValidPass12345',
    });
  });

  test('UC2-F-2: password abc123 fails rules and shows password rules error', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email or username/i), 'user1');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      PASSWORD_RULES_ERROR
    );
    expect(mockedRegister).not.toHaveBeenCalled();
  });
});
