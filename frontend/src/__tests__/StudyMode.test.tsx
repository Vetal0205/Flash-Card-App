//frontend test cases for UC4(qays)
//UC4- study a collection

//Halema  

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudyMode from '../pages/StudyMode';

jest.mock('../pages/useCurrentUser', () => ({
  useCurrentUser: () => ({ username: 'TestUser' }),
}));

jest.mock('../components/PauseSession', () => ({
  __esModule: true,
  default: ({ onResume, onDashboard }: any) => (
    <div>
      <p>Study session paused</p>
      <button onClick={onResume}>Resume Session</button>
      <button onClick={onDashboard}>Return to Dashboard</button>
    </div>
  ),
}));

beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => 'mock-token');
});

afterEach(() => jest.clearAllMocks());

const mockCards = [
  { flashcardID: 1, question: 'What is React?', answer: 'A JavaScript library for building UIs' },
  { flashcardID: 2, question: 'What is useState?', answer: 'A React hook for managing state' },
  { flashcardID: 3, question: 'What is JSX?', answer: 'A syntax extension for JavaScript' },
];

const mockCollections = [
  { collectionID: 1, collectionName: 'React Basics', description: null, visibility: 'private', createdAt: '2024-01-01' },
];

const setupFetch = () => {
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/flashcards')) {
      return Promise.resolve({ json: () => Promise.resolve(mockCards) } as Response);
    }
    if (url.includes('/collections')) {
      return Promise.resolve({ json: () => Promise.resolve(mockCollections) } as Response);
    }
    return Promise.resolve({ json: () => Promise.resolve({}) } as Response);
  }) as jest.Mock;
};

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={['/collections/1/study']}>
      <Routes>
        <Route path="/collections/:collectionId/study" element={<StudyMode />} />
      </Routes>
    </MemoryRouter>
  );

// Wait for any card to appear (cards are shuffled so we check all possible questions)
const waitForCard = async () => {
  await waitFor(() => {
    const allQuestions = mockCards.map(c => c.question);
    const found = allQuestions.some(q => screen.queryByText(q) !== null);
    expect(found).toBe(true);
  });
};

// Helper: flip the current card (click "Click to flip" text)
const flipCard = async () => {
  fireEvent.click(screen.getByText('Click to flip'));
  await waitFor(() => expect(screen.getByText('ANSWER')).toBeInTheDocument());
};

// UC4: Study a Collection in Random Mode 

describe('UC4 - Study a Collection in Random Mode', () => {

  // TC1: A flashcard question from the deck is shown when study mode loads
  test('TC1: A flashcard question is displayed when study mode loads', async () => {
    setupFetch();
    renderComponent();

    await waitForCard();

    // Confirm the QUESTION label is shown
    expect(screen.getByText('QUESTION')).toBeInTheDocument();
  });

  // TC2: Clicking the card flips it — label changes from QUESTION to ANSWER
  test('TC2: Clicking the flashcard flips it to reveal the answer', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());
    expect(screen.getByText('Click to flip')).toBeInTheDocument();

    await flipCard();

    expect(screen.getByText('ANSWER')).toBeInTheDocument();
    expect(screen.queryByText('Click to flip')).not.toBeInTheDocument();
  });

  // TC3: Clicking increments Known count
  test('TC3: Clicking "Got It" increments the known count to 1', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());
    await flipCard();

    fireEvent.click(screen.getByText('✓ Got It'));

    await waitFor(() => {
      expect(screen.getByText('✓ Known: 1')).toBeInTheDocument();
    });
  });

  // TC4: Clicking "✗ Didn't Know" increments Unknown count
  test("TC4: Clicking \"Didn't Know\" increments the unknown count to 1", async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());
    await flipCard();

    fireEvent.click(screen.getByText("✗ Didn't Know"));

    await waitFor(() => {
      expect(screen.getByText('✗ Unknown: 1')).toBeInTheDocument();
    });
  });

  // TC5: Session summary modal appears after all 3 cards are graded
  test('TC5: Session summary modal appears after reviewing all cards', async () => {
    setupFetch();
    renderComponent();

    // Grade all 3 cards one by one
    for (let i = 0; i < mockCards.length; i++) {
      // Wait for QUESTION label — signals a new card is showing
      await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());

      // Flip it
      fireEvent.click(screen.getByText('Click to flip'));
      await waitFor(() => expect(screen.getByText('ANSWER')).toBeInTheDocument());

      // Grade it — on the last card this triggers isComplete → modal
      fireEvent.click(screen.getByText('✓ Got It'));
    }

    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });
  });

  // TC6: Card flip DOM update completes within 500ms
  test('TC6: Card flip completes within 500ms', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());

    const start = performance.now();
    fireEvent.click(screen.getByText('Click to flip'));
    await waitFor(() => expect(screen.getByText('ANSWER')).toBeInTheDocument());
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  // TC7: Clicking "⏸ Pause" shows the PauseSession modal
  test('TC7: Clicking Pause shows the pause session modal', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());

    fireEvent.click(screen.getByText('⏸ Pause'));

    await waitFor(() => {
      expect(screen.getByText('Study session paused')).toBeInTheDocument();
    });
  });

  // TC8: Clicking "Resume Session" hides the modal and returns to the card
  test('TC8: Clicking Resume hides the pause modal and returns to the card', async () => {
    setupFetch();
    renderComponent();

    await waitFor(() => expect(screen.getByText('QUESTION')).toBeInTheDocument());

    fireEvent.click(screen.getByText('⏸ Pause'));
    await waitFor(() => expect(screen.getByText('Study session paused')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Resume Session'));

    await waitFor(() => {
      expect(screen.queryByText('Study session paused')).not.toBeInTheDocument();
    });

    expect(screen.getByText('QUESTION')).toBeInTheDocument();
  });
});
