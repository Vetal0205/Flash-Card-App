//frontend test cases for UC3(qays) +UC5 (qays)
//UC3- create flashcards collection
//UC5-Delete flashcard collection 

//Halema  

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollectionsDashboard from '../pages/CollectionsDashboard';

jest.mock('../pages/useCurrentUser', () => ({
  useCurrentUser: () => ({ username: 'TestUser' }),
}));

jest.mock('../components/RenameCollection', () => ({
  __esModule: true,
  default: ({ onSave, onCancel }: any) => (
    <div>
      <button onClick={() => onSave('Renamed')}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => 'mock-token');
});

afterEach(() => jest.clearAllMocks());

const mockCollections = [
  { collectionID: 1, collectionName: 'History 1301', description: null, visibility: 'private', createdAt: '2024-01-01' },
  { collectionID: 2, collectionName: 'Biology Review', description: null, visibility: 'private', createdAt: '2024-01-02' },
];

const setupFetch = () => {
  global.fetch = jest.fn((url: string, options?: any) => {
    const method = options?.method || 'GET';

    if (method === 'GET') {
      return Promise.resolve({
        json: () => Promise.resolve(mockCollections),
      } as Response);
    }

    if (method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          collectionID: 99,
          collectionName: body.collectionName,
          description: null,
          visibility: 'private',
          createdAt: '2024-06-01',
        }),
      } as Response);
    }

    if (method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    }

    return Promise.resolve({ json: () => Promise.resolve({}) } as Response);
  }) as jest.Mock;
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <CollectionsDashboard />
    </MemoryRouter>
  );

const openNewModal = async () => {
  await waitFor(() => expect(screen.getByText('History 1301')).toBeInTheDocument());
  fireEvent.click(screen.getByText('+ New Collection'));
  await waitFor(() => expect(screen.getByPlaceholderText('e.g. Biology 101')).toBeInTheDocument());
};

// ─── UC3: Create Flashcard Collection ────────────────────────────────────────

describe('UC3 - Create Flashcard Collection', () => {

  test('TC1: Valid collection name creates the collection successfully', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.change(screen.getByPlaceholderText('e.g. Biology 101'), {
      target: { value: 'CS 3354 Exam 1' },
    });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('CS 3354 Exam 1')).toBeInTheDocument();
    });
  });

  test('TC2: Valid collection name with no description still creates the collection', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.change(screen.getByPlaceholderText('e.g. Biology 101'), {
      target: { value: 'Practice Set' },
    });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Practice Set')).toBeInTheDocument();
    });
  });

  test('TC3: Empty collection name shows required error', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Collection name is required.')).toBeInTheDocument();
  });

  test('TC4: Invalid collection name (special chars) shows validation error', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.change(screen.getByPlaceholderText('e.g. Biology 101'), {
      target: { value: '@@@###' },
    });
    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Only letters, numbers, and spaces allowed.')).toBeInTheDocument();
  });

  test('TC5: Duplicate collection name shows duplicate error', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.change(screen.getByPlaceholderText('e.g. Biology 101'), {
      target: { value: 'History 1301' },
    });
    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('A collection with this name already exists.')).toBeInTheDocument();
  });

  test('TC6: Created collection appears in the list', async () => {
    setupFetch();
    renderComponent();
    await openNewModal();

    fireEvent.change(screen.getByPlaceholderText('e.g. Biology 101'), {
      target: { value: 'Chemistry Set 1' },
    });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Chemistry Set 1')).toBeInTheDocument();
    });
  });
});

// uc5 

describe('UC5 - Delete Flashcard Collection', () => {

  test('TC1: Confirming deletion removes the collection', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('History 1301')).toBeInTheDocument());

    // Click the Delete button on the first collection card
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for the confirmation modal
    const modal = await waitFor(() => screen.getByText(/Are you sure you want to delete/i));
    expect(modal).toBeInTheDocument();

    // Click Delete inside the modal specifically (use closest modal container)
    const overlay = screen.getByText(/Are you sure you want to delete/i).closest('div[style]')!;
    fireEvent.click(within(overlay).getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });

  test('TC2: Cancelling deletion keeps the collection', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('History 1301')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('History 1301')).toBeInTheDocument();
  });

  test('TC3: Deleted collection is removed from the list', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('History 1301')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    const overlay = screen.getByText(/Are you sure you want to delete/i).closest('div[style]')!;
    fireEvent.click(within(overlay).getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('History 1301')).not.toBeInTheDocument();
    });
  });
});
