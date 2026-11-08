// types.ts
export interface SearchResult {
  index: number;
  length: number;
  text: string;
}

export interface EditorState {
  content: string;
  selectionStart: number;
  selectionEnd: number;
  timestamp: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface ReplaceResult {
  success: boolean;
  occurrencesReplaced: number;
  newContent: string;
}

export interface PDFExportOptions {
  filename: string;
  format: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: number;
  scale: number;
}

export interface StatusInfo {
  words: number;
  characters: number;
  lines: number;
  currentLine: number;
  currentColumn: number;
}