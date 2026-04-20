import { apiBase, bearerAuthHeaders, getMinddeckToken } from './apiAuth';

export type FlashcardDto = {
  flashcardID: number;
  collectionID: number;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  return data.error ?? data.message ?? `Request failed (${res.status})`;
}

function requireToken(): void {
  if (!getMinddeckToken()) {
    throw new Error('Please sign in to continue.');
  }
}

export async function getFlashcards(collectionId: string | number): Promise<FlashcardDto[]> {
  requireToken();
  const res = await fetch(`${apiBase()}/api/v1/collections/${collectionId}/flashcards`, {
    method: 'GET',
    headers: bearerAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as FlashcardDto[];
}

export async function duplicateFlashcard(
  collectionId: string | number,
  flashcardId: string | number
): Promise<FlashcardDto> {
  requireToken();
  const res = await fetch(
    `${apiBase()}/api/v1/collections/${collectionId}/flashcards/${flashcardId}/duplicate`,
    {
      method: 'POST',
      headers: bearerAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as FlashcardDto;
}
