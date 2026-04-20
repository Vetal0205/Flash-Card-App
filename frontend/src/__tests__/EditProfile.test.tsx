// Halema Diab
// UC6 - Edit Profile; FR-09 delete account (password confirm)
// maps to FR-08, FR-09, FR-25, FR-28

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EditProfile from '../pages/EditProfile';

const profilePayload = { username: 'Jane Doe', email: 'jane@example.com' };

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe('EditProfile — profile (FR-08)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockNavigate.mockClear();
    sessionStorage.setItem('minddeck_token', 'test-jwt');
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/users/me') && (!init?.method || init.method === 'GET')) {
        return jsonResponse(profilePayload);
      }
      if (url.includes('/api/v1/users/me') && init?.method === 'PATCH') {
        return jsonResponse({ ...profilePayload });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url} ${init?.method ?? ''}`));
    }) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
    localStorage.clear();
  });

  test('TC1 - valid inputs shows success message', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    await userEvent.clear(screen.getByPlaceholderText('Your username'));
    await userEvent.type(screen.getByPlaceholderText('Your username'), 'Alex Morgan');
    await userEvent.clear(screen.getByPlaceholderText('your@email.com'));
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'alex@email.com');
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  test('TC2 - empty username shows error', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    await userEvent.clear(screen.getByPlaceholderText('Your username'));
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
  });

  test('TC3 - invalid email format shows error', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    await userEvent.clear(screen.getByPlaceholderText('your@email.com'));
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'notanemail');
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  test('TC4 - password under 12 characters shows error', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    const newPasswordInput = passwordInputs[1];
    await userEvent.type(newPasswordInput, 'abc123');
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.getByText('Password must be at least 12 characters.')).toBeInTheDocument();
  });

  test('TC5 - cancel resets fields to original values', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    await userEvent.clear(screen.getByPlaceholderText('Your username'));
    await userEvent.type(screen.getByPlaceholderText('Your username'), 'New Name');
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your username')).toHaveValue('Jane Doe');
    });
  });

  test('TC6 - profile update completes within 2 seconds', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });

    const start = performance.now();
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe('EditProfile — FR-09 delete account', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockNavigate.mockClear();
    sessionStorage.setItem('minddeck_token', 'test-jwt');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sessionStorage.clear();
    localStorage.clear();
  });

  async function renderLoaded() {
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/users/me') && (!init?.method || init.method === 'GET')) {
        return jsonResponse(profilePayload);
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url} ${init?.method ?? ''}`));
    }) as jest.Mock;

    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
    });
  }

  test('FR-09 TC1 — valid password and Confirm deletes and redirects to sign-up', async () => {
    await renderLoaded();

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/users/me') && (!init?.method || init.method === 'GET')) {
        return jsonResponse(profilePayload);
      }
      if (url.includes('/api/v1/users/me') && init?.method === 'DELETE') {
        expect(init.body).toBe(JSON.stringify({ password: 'CorrectPassword123!' }));
        return jsonResponse({ deleted: true, message: 'Account deleted successfully.' });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/CONFIRM PASSWORD/i), 'CorrectPassword123!');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    const deleteCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'DELETE');
    expect(deleteCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('FR-09 TC2 — incorrect password shows Incorrect Password', async () => {
    await renderLoaded();

    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/users/me') && (!init?.method || init.method === 'GET')) {
        return jsonResponse(profilePayload);
      }
      if (url.includes('/api/v1/users/me') && init?.method === 'DELETE') {
        return jsonResponse({ message: 'Incorrect Password' }, 401);
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/CONFIRM PASSWORD/i), 'wrongpass');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(within(dialog).getByText('Incorrect Password')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/register');
  });

  test('FR-09 TC3 — empty password shows Incomplete Field and does not DELETE', async () => {
    await renderLoaded();

    const fetchMock = global.fetch as jest.Mock;

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(within(dialog).getByText('Incomplete Field')).toBeInTheDocument();
    });

    const deleteCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'DELETE');
    expect(deleteCalls).toHaveLength(0);
  });

  test('FR-09 TC4 — Cancel does not call DELETE', async () => {
    await renderLoaded();

    const fetchMock = global.fetch as jest.Mock;

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/CONFIRM PASSWORD/i), 'CorrectPassword123!');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const deleteCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'DELETE');
    expect(deleteCalls).toHaveLength(0);
  });

  test('FR-09 TC5 — closing dialog (overlay) does not call DELETE', async () => {
    await renderLoaded();

    const fetchMock = global.fetch as jest.Mock;

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    await screen.findByRole('dialog');

    const overlays = document.querySelectorAll('[role="presentation"]');
    expect(overlays.length).toBeGreaterThan(0);
    fireEvent.click(overlays[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const deleteCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'DELETE');
    expect(deleteCalls).toHaveLength(0);
  });
});
