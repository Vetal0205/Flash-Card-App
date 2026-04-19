// FR-01, FR-22, FR-23: supported import file formats and their text-extraction functions.
// To add a new format: add one entry to PARSERS with its mimetype and an ExtractFn.
// Note: 'application/pdf' is export-only and must NOT be added here.

export type ExtractFn = (buffer: Buffer) => string;

export const PARSERS = new Map<string, ExtractFn>([
    ['text/plain', (buffer) => buffer.toString('utf-8')],
]);
