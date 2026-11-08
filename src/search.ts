// boyer-moore.ts
import { SearchResult, SearchOptions, ReplaceResult } from './types';

/**
 * Classe que implementa o algoritmo Boyer-Moore para busca de padrões em texto.
 * Utiliza as heurísticas de "bad character" e "good suffix" para otimizar a busca.
 */
export class BoyerMoore {
  private badCharTable: Map<string, number>;
  private goodSuffixTable: number[];

  constructor() {
    this.badCharTable = new Map();
    this.goodSuffixTable = [];
  }

  /**
   * Constrói a tabela de bad character (última ocorrência de cada caractere no padrão)
   */
  private buildBadCharacterTable(pattern: string): void {
    this.badCharTable.clear();
    const m = pattern.length;

    for (let i = 0; i < m - 1; i++) {
      this.badCharTable.set(pattern[i], i);
    }
  }

  /**
   * Constrói a tabela de good suffix (para saltos otimizados quando há mismatch)
   */
  private buildGoodSuffixTable(pattern: string): void {
    const m = pattern.length;
    this.goodSuffixTable = new Array(m).fill(0);

    const suffix = this.computeSuffix(pattern);

    // Caso 1: matching suffix aparece em outro lugar no padrão
    for (let i = 0; i < m; i++) {
      this.goodSuffixTable[i] = m;
    }

    let j = 0;
    for (let i = m - 1; i >= -1; i--) {
      if (i === -1 || suffix[i] === i + 1) {
        for (; j < m - 1 - i; j++) {
          if (this.goodSuffixTable[j] === m) {
            this.goodSuffixTable[j] = m - 1 - i;
          }
        }
      }
    }

    // Caso 2: matching suffix coincide com prefixo do padrão
    for (let i = 0; i <= m - 2; i++) {
      this.goodSuffixTable[m - 1 - suffix[i]] = m - 1 - i;
    }
  }

  /**
   * Computa o array de suffix para o good suffix heuristic
   */
  private computeSuffix(pattern: string): number[] {
    const m = pattern.length;
    const suffix = new Array(m).fill(0);

    suffix[m - 1] = m;
    let g = m - 1;
    let f = 0;

    for (let i = m - 2; i >= 0; i--) {
      if (i > g && suffix[i + m - 1 - f] < i - g) {
        suffix[i] = suffix[i + m - 1 - f];
      } else {
        if (i < g) {
          g = i;
        }
        f = i;
        while (g >= 0 && pattern[g] === pattern[g + m - 1 - f]) {
          g--;
        }
        suffix[i] = f - g;
      }
    }

    return suffix;
  }

  /**
   * Aplica normalização do texto conforme as opções de busca
   */
  private normalize(text: string, options: SearchOptions): string {
    return options.caseSensitive ? text : text.toLowerCase();
  }

  /**
   * Verifica se a ocorrência é uma palavra inteira
   */
  private isWholeWord(text: string, index: number, patternLength: number): boolean {
    const before = index > 0 ? text[index - 1] : ' ';
    const after = index + patternLength < text.length ? text[index + patternLength] : ' ';
    const wordBoundary = /[\s\p{P}\p{S}]/u;
    return wordBoundary.test(before) && wordBoundary.test(after);
  }

  /**
   * Busca todas as ocorrências do padrão no texto usando Boyer-Moore
   */
  search(text: string, pattern: string, options: SearchOptions = { caseSensitive: false, wholeWord: false }): SearchResult[] {
    if (!pattern || !text || pattern.length > text.length) {
      return [];
    }

    const normalizedText = this.normalize(text, options);
    const normalizedPattern = this.normalize(pattern, options);

    this.buildBadCharacterTable(normalizedPattern);
    this.buildGoodSuffixTable(normalizedPattern);

    const results: SearchResult[] = [];
    const n = normalizedText.length;
    const m = normalizedPattern.length;
    let shift = 0;

    while (shift <= n - m) {
      let j = m - 1;

      // Compara o padrão com o texto da direita para a esquerda
      while (j >= 0 && normalizedPattern[j] === normalizedText[shift + j]) {
        j--;
      }

      if (j < 0) {
        // Ocorrência encontrada
        const originalText = text.substring(shift, shift + m);

        if (!options.wholeWord || this.isWholeWord(text, shift, m)) {
          results.push({
            index: shift,
            length: m,
            text: originalText
          });
        }

        shift += (this.goodSuffixTable[0] || 1);
      } else {
        // Mismatch - calcula o salto máximo entre bad char e good suffix
        const badCharShift = j - (this.badCharTable.get(normalizedText[shift + j]) ?? -1);
        const goodSuffixShift = this.goodSuffixTable[j] || 0;
        shift += Math.max(1, badCharShift, goodSuffixShift);
      }
    }

    return results;
  }

  /**
   * Substitui uma ocorrência específica pelo novo texto
   */
  replaceOne(text: string, pattern: string, replacement: string, occurrenceIndex: number, options: SearchOptions = { caseSensitive: false, wholeWord: false }): ReplaceResult {
    const results = this.search(text, pattern, options);

    if (occurrenceIndex < 0 || occurrenceIndex >= results.length) {
      return { success: false, occurrencesReplaced: 0, newContent: text };
    }

    const target = results[occurrenceIndex];
    const newContent = text.substring(0, target.index) + replacement + text.substring(target.index + target.length);

    return {
      success: true,
      occurrencesReplaced: 1,
      newContent
    };
  }

  /**
   * Substitui todas as ocorrências pelo novo texto
   */
  replaceAll(text: string, pattern: string, replacement: string, options: SearchOptions = { caseSensitive: false, wholeWord: false }): ReplaceResult {
    const results = this.search(text, pattern, options);

    if (results.length === 0) {
      return { success: false, occurrencesReplaced: 0, newContent: text };
    }

    // Substitui de trás para frente para preservar os índices
    let newContent = text;
    for (let i = results.length - 1; i >= 0; i--) {
      const occ = results[i];
      newContent = newContent.substring(0, occ.index) + replacement + newContent.substring(occ.index + occ.length);
    }

    return {
      success: true,
      occurrencesReplaced: results.length,
      newContent
    };
  }
}

// Exporta uma instância singleton para uso global
export const boyerMoore = new BoyerMoore();