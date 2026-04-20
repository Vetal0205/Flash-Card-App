//frontend test cases for UC10 (Aaliyan) + UC11 (Aaliyan)

//Halema 

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FlashcardList from '../pages/FlashcardList';

jest.mock('../pages/useCurrentUser', () => ({
  useCurrentUser: () => ({ username: 'TestUser' }),
}));

jest.mock('../components/FileUploadZone', () => ({
  __esModule: true,
  default: ({ onFilesSelected, disabled }: any) => (
    <input
      data-testid="file-upload-input"
      type="file"
      disabled={disabled}
      onChange={(e) => onFilesSelected(e.target.files)}
    />
  ),
}));

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => 'mock-token');
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const mockFlashcards = [
  { flashcardID: 1, collectionID: 1, question: 'What is React?', answer: 'A JS library', isFlaggedDifficult: false },
  { flashcardID: 2, collectionID: 1, question: 'What is JSX?', answer: 'A syntax extension', isFlaggedDifficult: false },
];

const mockCollections = [
  { collectionID: 1, collectionName: 'Biology 101', description: null, visibility: 'private', createdAt: '2024-01-01' },
];

const makeFile = (name: string, content: string, type: string): File =>
  new File([content], name, { type });

const setupFetch = (overrides: { import?: Promise<any>; export?: Promise<any> } = {}) => {
  global.fetch = jest.fn((url: string, options?: any) => {
    const method = options?.method || 'GET';

    if (url.includes('/flagged')) {
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }
    if (url.includes('/flashcards') && method === 'GET') {
      return Promise.resolve({ json: () => Promise.resolve(mockFlashcards) } as Response);
    }
    if (url.includes('/collections') && method === 'GET') {
      return Promise.resolve({ json: () => Promise.resolve(mockCollections) } as Response);
    }
    if (url.includes('/import') && method === 'POST') {
      return overrides.import ?? Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: '2 flashcard(s) successfully imported.' }),
      } as Response);
    }
    if (url.includes('/export')) {
      return overrides.export ?? Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['%PDF-mock'], { type: 'application/pdf' })),
      } as Response);
    }

    return Promise.resolve({ json: () => Promise.resolve({}) } as Response);
  }) as jest.Mock;
};

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={['/collections/1']}>
      <Routes>
        <Route path="/collections/:collectionId" element={<FlashcardList />} />
      </Routes>
    </MemoryRouter>
  );

// Wait for the flashcard table to load
const waitForLoad = async () => {
  await waitFor(() => expect(screen.getByText('What is React?')).toBeInTheDocument());
};

// Open the import modal
const openImportModal = async () => {
  fireEvent.click(screen.getByText('⬆ Import'));
  await waitFor(() => expect(screen.getByTestId('file-upload-input')).toBeInTheDocument());
};

// ─── UC10: Import Flashcards from File ───────────────────────────────────────

describe('UC10 - Import Flashcards from File', () => {

   test('TC1: Valid .txt file imports flashcards successfully', async () => {
    setupFetch();
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('valid_flashcards.txt', 'Q: What is gravity?\nA: A force.', 'text/plain');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.queryByText(/unsupported file format/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/import failed/i)).not.toBeInTheDocument();
    });
  });

  // TC2: Valid .pdf file → imports successfully, no error shown
  test('TC2: Valid .pdf file imports flashcards successfully', async () => {
    setupFetch();
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('valid_flashcards.pdf', '%PDF-mock content', 'application/pdf');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.queryByText(/unsupported file format/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/import failed/i)).not.toBeInTheDocument();
    });
  });

   test('TC3: Unsupported .docx file shows unsupported format error', async () => {
    setupFetch({
      import: Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Unsupported file format.' }),
      } as Response),
    });
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('flashcards.docx', 'mock docx content', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Unsupported file format.')).toBeInTheDocument();
    });
  });

   test('TC4: Unsupported .jpg file shows unsupported format error', async () => {
    setupFetch({
      import: Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Unsupported file format.' }),
      } as Response),
    });
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('photo.jpg', 'mock image data', 'image/jpeg');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Unsupported file format.')).toBeInTheDocument();
    });
  });

   test('TC5: No file selected does not trigger an import request', async () => {
    setupFetch();
    renderComponent();
    await waitForLoad();
    await openImportModal();

     fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [] } });

    // Modal is still open
    expect(screen.getByText('Import Flashcards')).toBeInTheDocument();

    // No import fetch was made
    const calls = (global.fetch as jest.Mock).mock.calls;
    const importCall = calls.find(([url]: [string]) => url.includes('/import'));
    expect(importCall).toBeUndefined();
  });

  // TC6: Empty .txt file → shows "The uploaded file contains no recognizable flashcard data."
  test('TC6: Empty .txt file shows no recognizable data error', async () => {
    setupFetch({
      import: Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'The uploaded file contains no recognizable flashcard data.' }),
      } as Response),
    });
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('empty.txt', '', 'text/plain');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('The uploaded file contains no recognizable flashcard data.')).toBeInTheDocument();
    });
  });

  // TC7: No auth token → shows error from server
  test('TC7: Unauthenticated import attempt shows an error', async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    setupFetch({
      import: Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Unauthorized.' }),
      } as Response),
    });
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('valid_flashcards.txt', 'Q: What?\nA: Something.', 'text/plain');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Unauthorized.')).toBeInTheDocument();
    });
  });

  // TC8: File with no Q/A structure → shows "No valid flashcard format detected."
  test('TC8: File with invalid Q/A structure shows format detected error', async () => {
    setupFetch({
      import: Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'No valid flashcard format detected.' }),
      } as Response),
    });
    renderComponent();
    await waitForLoad();
    await openImportModal();

    const file = makeFile('unstructured.txt', 'Hello world\nThis is not a flashcard', 'text/plain');
    fireEvent.change(screen.getByTestId('file-upload-input'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('No valid flashcard format detected.')).toBeInTheDocument();
    });
  });

  // TC9: Clicking Cancel closes the import modal
  test('TC9: Clicking Cancel closes the import modal', async () => {
    setupFetch();
    renderComponent();
    await waitForLoad();
    await openImportModal();

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Import Flashcards')).not.toBeInTheDocument();
    });
  });
});

// ─── UC11: Export Flashcard Collection as PDF ─────────────────────────────────

describe('UC11 - Export Flashcard Collection as PDF', () => {

  // TC1: Export button clicked → anchor .click() is called to trigger download
  test('TC1: Exporting a collection triggers a PDF download', async () => {
    setupFetch();

    const mockClick = jest.fn();
    const mockAnchor = { href: '', download: '', click: mockClick } as any;
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor;
      // Fall through for all other elements so React renders normally
      return document.createElement.call(document, tag);
    });

    renderComponent();
    await waitForLoad();

    fireEvent.click(screen.getByText('⬇ Export PDF'));

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });

    expect(mockAnchor.download).toBe('collection-1.pdf');
  });

  // TC2: Export fetch fails → UI doesn't crash, flashcards still visible
  test('TC2: Failed export does not crash the UI', async () => {
    setupFetch({
      export: Promise.reject(new Error('Network error')),
    });
    renderComponent();
    await waitForLoad();

    // Should not throw
    fireEvent.click(screen.getByText('⬇ Export PDF'));

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
  });

  // TC3: Export PDF button is visible and not disabled
  test('TC3: Export PDF button is visible and clickable', async () => {
    setupFetch();
    renderComponent();
    await waitForLoad();

    const exportBtn = screen.getByText('⬇ Export PDF');
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).not.toBeDisabled();
  });

  // TC4: Export fetch is called with the correct collection endpoint
  test('TC4: Export request targets the correct collection endpoint', async () => {
    setupFetch();

    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return { href: '', download: '', click: jest.fn() } as any;
      return document.createElement.call(document, tag);
    });

    renderComponent();
    await waitForLoad();

    fireEvent.click(screen.getByText('⬇ Export PDF'));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const exportCall = calls.find(([url]: [string]) => url.includes('/export'));
      expect(exportCall).toBeDefined();
      expect(exportCall[0]).toContain('/collections/1/export');
    });
  });
});
