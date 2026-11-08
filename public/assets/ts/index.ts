// ui-controller.ts
import { boyerMoore } from '../../../src/search';
import { historyManager } from '../../../src/stack';
import { pdfExporter } from '../../../src/exportPdf';
import { SearchResult, StatusInfo, SearchOptions } from '../../../src/types';

/**
 * Controlador principal da interface do editor
 * Gerencia eventos, atualiza a UI e integra todos os módulos
 */
export class UIController {
  private editorElement: HTMLElement | null;
  private searchInput: HTMLInputElement | null;
  private replaceInput: HTMLInputElement | null;
  private searchInfo: HTMLElement | null;
  private searchPanel: HTMLElement | null;
  private statusWords: HTMLElement | null;
  private statusChars: HTMLElement | null;
  private statusLines: HTMLElement | null;
  private statusPosition: HTMLElement | null;
  private undoBtn: HTMLButtonElement | null;
  private redoBtn: HTMLButtonElement | null;

  private currentResults: SearchResult[];
  private currentResultIndex: number;
  private searchOptions: SearchOptions;

  constructor() {
    this.editorElement = null;
    this.searchInput = null;
    this.replaceInput = null;
    this.searchInfo = null;
    this.searchPanel = null;
    this.statusWords = null;
    this.statusChars = null;
    this.statusLines = null;
    this.statusPosition = null;
    this.undoBtn = null;
    this.redoBtn = null;

    this.currentResults = [];
    this.currentResultIndex = -1;
    this.searchOptions = { caseSensitive: false, wholeWord: false };

    this.init();
  }

  /**
   * Inicializa o controlador
   */
  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Configura os elementos e event listeners
   */
  private setup(): void {
    // Captura elementos do DOM
    this.editorElement = document.querySelector('[data-editor]');
    this.searchInput = document.querySelector('#search');
    this.replaceInput = document.querySelector('#replace');
    this.searchInfo = document.querySelector('[data-search-info]');
    this.searchPanel = document.querySelector('[data-search-panel]');
    this.statusWords = document.querySelector('[data-status-words]');
    this.statusChars = document.querySelector('[data-status-chars]');
    this.statusLines = document.querySelector('[data-status-lines]');
    this.statusPosition = document.querySelector('[data-status-position]');
    this.undoBtn = document.querySelector('[data-action="undo"]');
    this.redoBtn = document.querySelector('[data-action="redo"]');

    if (!this.editorElement) {
      console.error('Elemento do editor não encontrado');
      return;
    }

    this.setupEventListeners();
    this.setupHistoryCallbacks();
    this.updateStatus();
    this.updateUndoRedoButtons();

    // Captura estado inicial
    historyManager.captureStateImmediate(
      this.editorElement.textContent || '',
      0,
      0
    );
  }

  /**
   * Configura todos os event listeners
   */
  private setupEventListeners(): void {
    // Eventos do editor
    if (this.editorElement) {
      this.editorElement.addEventListener('input', () => this.handleEditorInput());
      this.editorElement.addEventListener('keyup', () => this.updateCursorPosition());
      this.editorElement.addEventListener('click', () => this.updateCursorPosition());
    }

    // Eventos de busca
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.handleSearch());
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.nextResult();
        }
      });
    }

    // Botões da toolbar
    document.querySelector('[data-action="undo"]')?.addEventListener('click', () => this.undo());
    document.querySelector('[data-action="redo"]')?.addEventListener('click', () => this.redo());
    document.querySelector('[data-action="search"]')?.addEventListener('click', () => this.toggleSearchPanel());
    document.querySelector('[data-action="export-pdf"]')?.addEventListener('click', () => this.exportPDF());
    document.querySelector('[data-action="close-search"]')?.addEventListener('click', () => this.closeSearchPanel());
    document.querySelector('[data-action="prev-result"]')?.addEventListener('click', () => this.prevResult());
    document.querySelector('[data-action="next-result"]')?.addEventListener('click', () => this.nextResult());
    document.querySelector('[data-action="replace-one"]')?.addEventListener('click', () => this.replaceOne());
    document.querySelector('[data-action="replace-all"]')?.addEventListener('click', () => this.replaceAll());

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  /**
   * Configura callbacks do histórico
   */
  private setupHistoryCallbacks(): void {
    historyManager.onStateChange((canUndo, canRedo) => {
      this.updateUndoRedoButtons();
    });
  }

  /**
   * Manipula input no editor
   */
  private handleEditorInput(): void {
    if (!this.editorElement) return;

    const content = this.editorElement.textContent || '';
    const selection = window.getSelection();
    const selectionStart = selection?.anchorOffset || 0;
    const selectionEnd = selection?.focusOffset || 0;

    historyManager.captureState(content, selectionStart, selectionEnd);
    this.updateStatus();

    // Re-executa busca se houver termo
    if (this.searchInput?.value) {
      this.handleSearch();
    }
  }

  /**
   * Atualiza a posição do cursor na status bar
   */
  private updateCursorPosition(): void {
    if (!this.editorElement || !this.statusPosition) return;

    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    // Calcula linha e coluna aproximadas
    const text = this.editorElement.textContent || '';
    const range = document.createRange();
    range.selectNodeContents(this.editorElement);
    range.setEnd(selection.anchorNode, selection.anchorOffset);
    const offset = range.toString().length;

    const lines = text.substring(0, offset).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    this.statusPosition.textContent = `Ln ${line}, Col ${column}`;
  }

  /**
   * Manipula busca de texto
   */
  private handleSearch(): void {
    if (!this.editorElement || !this.searchInput) return;

    const query = this.searchInput.value;

    if (!query) {
      this.clearHighlights();
      this.currentResults = [];
      this.currentResultIndex = -1;
      this.updateSearchInfo();
      return;
    }

    const text = this.editorElement.textContent || '';
    this.currentResults = boyerMoore.search(text, query, this.searchOptions);
    this.currentResultIndex = this.currentResults.length > 0 ? 0 : -1;

    this.highlightResults();
    this.updateSearchInfo();

    if (this.currentResultIndex >= 0) {
      this.scrollToCurrentResult();
    }
  }

  /**
   * Destaca os resultados da busca no editor
   */
  private highlightResults(): void {
    if (!this.editorElement) return;

    this.clearHighlights();

    const text = this.editorElement.textContent || '';
    if (this.currentResults.length === 0) return;

    // Cria HTML com destaques
    let html = '';
    let lastIndex = 0;

    this.currentResults.forEach((result, index) => {
      html += this.escapeHtml(text.substring(lastIndex, result.index));
      const className = index === this.currentResultIndex ? 'highlight current' : 'highlight';
      html += `<span class="${className}" data-result-index="${index}">${this.escapeHtml(result.text)}</span>`;
      lastIndex = result.index + result.length;
    });

    html += this.escapeHtml(text.substring(lastIndex));
    this.editorElement.innerHTML = html;
  }

  /**
   * Remove todos os destaques
   */
  private clearHighlights(): void {
    if (!this.editorElement) return;

    const highlights = this.editorElement.querySelectorAll('.highlight');
    highlights.forEach(h => {
      const parent = h.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(h.textContent || ''), h);
        parent.normalize();
      }
    });
  }

  /**
   * Rola o editor até o resultado atual
   */
  private scrollToCurrentResult(): void {
    const current = this.editorElement?.querySelector('.highlight.current');
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Atualiza o painel de informações da busca
   */
  private updateSearchInfo(): void {
    if (!this.searchInfo) return;

    const total = this.currentResults.length;
    const current = this.currentResultIndex >= 0 ? this.currentResultIndex + 1 : 0;

    this.searchInfo.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span><span class="count">${total}</span> ocorrências encontradas · <span class="count">${current}</span> de ${total}</span>
    `;
  }

  /**
   * Navega para o próximo resultado
   */
  private nextResult(): void {
    if (this.currentResults.length === 0) return;
    this.currentResultIndex = (this.currentResultIndex + 1) % this.currentResults.length;
    this.highlightResults();
    this.updateSearchInfo();
    this.scrollToCurrentResult();
  }

  /**
   * Navega para o resultado anterior
   */
  private prevResult(): void {
    if (this.currentResults.length === 0) return;
    this.currentResultIndex = (this.currentResultIndex - 1 + this.currentResults.length) % this.currentResults.length;
    this.highlightResults();
    this.updateSearchInfo();
    this.scrollToCurrentResult();
  }

  /**
   * Substitui a ocorrência atual
   */
  private replaceOne(): void {
    if (!this.editorElement || !this.searchInput || !this.replaceInput) return;
    if (this.currentResultIndex < 0) return;

    const text = this.editorElement.textContent || '';
    const query = this.searchInput.value;
    const replacement = this.replaceInput.value;

    const result = boyerMoore.replaceOne(text, query, replacement, this.currentResultIndex, this.searchOptions);

    if (result.success) {
      historyManager.captureStateImmediate(result.newContent, 0, 0);
      this.editorElement.textContent = result.newContent;
      this.handleSearch();
      this.updateStatus();
    }
  }

  /**
   * Substitui todas as ocorrências
   */
  private replaceAll(): void {
    if (!this.editorElement || !this.searchInput || !this.replaceInput) return;

    const text = this.editorElement.textContent || '';
    const query = this.searchInput.value;
    const replacement = this.replaceInput.value;

    if (!query) return;

    const result = boyerMoore.replaceAll(text, query, replacement, this.searchOptions);

    if (result.success) {
      historyManager.captureStateImmediate(result.newContent, 0, 0);
      this.editorElement.textContent = result.newContent;
      this.handleSearch();
      this.updateStatus();
    }
  }

  /**
   * Desfaz a última ação
   */
  private undo(): void {
    const state = historyManager.undo();
    if (state && this.editorElement) {
      this.editorElement.textContent = state.content;
      this.updateStatus();
    }
  }

  /**
   * Refaz a última ação desfeita
   */
  private redo(): void {
    const state = historyManager.redo();
    if (state && this.editorElement) {
      this.editorElement.textContent = state.content;
      this.updateStatus();
    }
  }

  /**
   * Atualiza estado dos botões de undo/redo
   */
  private updateUndoRedoButtons(): void {
    if (this.undoBtn) {
      this.undoBtn.disabled = !historyManager.canUndo();
      this.undoBtn.style.opacity = historyManager.canUndo() ? '1' : '0.5';
    }
    if (this.redoBtn) {
      this.redoBtn.disabled = !historyManager.canRedo();
      this.redoBtn.style.opacity = historyManager.canRedo() ? '1' : '0.5';
    }
  }

  /**
   * Abre/fecha o painel de busca
   */
  private toggleSearchPanel(): void {
    if (!this.searchPanel) return;

    const isHidden = this.searchPanel.style.display === 'none';
    this.searchPanel.style.display = isHidden ? 'grid' : 'none';

    if (isHidden && this.searchInput) {
      this.searchInput.focus();
    }
  }

  /**
   * Fecha o painel de busca
   */
  private closeSearchPanel(): void {
    if (this.searchPanel) {
      this.searchPanel.style.display = 'none';
      this.clearHighlights();
      this.currentResults = [];
      this.currentResultIndex = -1;
      if (this.searchInput) this.searchInput.value = '';
      if (this.replaceInput) this.replaceInput.value = '';
    }
  }

  /**
   * Exporta o conteúdo para PDF
   */
  private async exportPDF(): Promise<void> {
    if (!this.editorElement) return;

    const btn = document.querySelector('[data-action="export-pdf"]') as HTMLButtonElement;
    const originalText = btn?.innerHTML;

    try {
      if (btn) {
        btn.innerHTML = '<span>Exportando...</span>';
        btn.disabled = true;
      }

      await pdfExporter.exportToPDF(this.editorElement, {
        filename: 'documento.pdf',
        format: 'a4',
        orientation: 'portrait',
        margin: 20,
        scale: 2
      });
    } catch (error) {
      alert('Erro ao exportar PDF. Verifique o console para mais detalhes.');
      console.error(error);
    } finally {
      if (btn) {
        btn.innerHTML = originalText || '';
        btn.disabled = false;
      }
    }
  }

  /**
   * Atualiza as informações de status (palavras, caracteres, linhas)
   */
  private updateStatus(): void {
    if (!this.editorElement) return;

    const text = this.editorElement.textContent || '';
    const info = this.calculateStatus(text);

    if (this.statusWords) this.statusWords.textContent = info.words.toString();
    if (this.statusChars) this.statusChars.textContent = info.characters.toString();
    if (this.statusLines) this.statusLines.textContent = info.lines.toString();
  }

  /**
   * Calcula estatísticas do texto
   */
  private calculateStatus(text: string): StatusInfo {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const lines = text.split('\n').length;

    return {
      words,
      characters,
      lines,
      currentLine: 1,
      currentColumn: 1
    };
  }

  /**
   * Manipula atalhos de teclado
   */
  private handleKeyboardShortcuts(e: KeyboardEvent): void {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    } else if (ctrl && e.key === 'y') {
      e.preventDefault();
      this.redo();
    } else if (ctrl && e.key === 'h') {
      e.preventDefault();
      this.toggleSearchPanel();
    } else if (ctrl && e.key === 'f') {
      e.preventDefault();
      this.toggleSearchPanel();
      if (this.searchInput) this.searchInput.focus();
    } else if (ctrl && e.key === 's') {
      e.preventDefault();
      // Simula salvamento automático
      console.log('Documento salvo automaticamente');
    }
  }

  /**
   * Escapa caracteres HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inicializa o controlador quando o script é carregado
const uiController = new UIController();