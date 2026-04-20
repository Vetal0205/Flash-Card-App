import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FlashcardList from './FlashcardList';

describe('FlashcardList', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    sessionStorage.setItem('minddeck_token', 'test-jwt');
    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
    global.fetch = originalFetch;
  });

  function renderList(collectionId = '42') {
    return render(
      <MemoryRouter initialEntries={[`/collections/${collectionId}`]}>
        <Routes>
          <Route path="/collections/:collectionId" element={<FlashcardList />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('loads flashcards and duplicate sends POST then appends new row', async () => {
    const cardA = {
      flashcardID: 1,
      collectionID: 42,
      question: 'Capital of France?',
      answer: 'Paris',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    const cardDuplicate = {
      flashcardID: 2,
      collectionID: 42,
      question: 'Capital of France?',
      answer: 'Paris',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/duplicate')) {
        expect(init?.method).toBe('POST');
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(cardDuplicate),
        } as Response);
      }
      if (url.includes('/users/me')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ username: 'tester' }),
        } as Response);
      }
      if (url.includes('/flashcards/flagged')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (url.includes('/collections/42/flashcards') && !url.includes('flagged')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([cardA]),
        } as Response);
      }
      try {
        const pathname = new URL(url).pathname;
        if (pathname === '/api/v1/collections') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                { collectionID: 42, collectionName: 'Test Deck', visibility: 'private' },
              ]),
          } as Response);
        }
      } catch {
        /* ignore */
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    }) as jest.Mock;

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Capital of France?')).toBeInTheDocument();
    });

    const dupBtn = screen.getByRole('button', { name: /^Duplicate$/i });
    await userEvent.click(dupBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Capital of France?').length).toBe(2);
    });

    expect(global.fetch).toHaveBeenCalled();
    const postCall = (global.fetch as jest.Mock).mock.calls.find((c) =>
      String(c[0]).includes('/flashcards/1/duplicate')
    );
    expect(postCall).toBeDefined();
    expect(postCall![1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt',
        }),
      })
    );
  });
});
