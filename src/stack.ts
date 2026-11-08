// history-stack.ts
import { EditorState } from './types';

/**
 * Implementação genérica de pilha (LIFO - Last In, First Out)
 */
export class Stack<T> {
  private items: T[];
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.items = [];
    this.maxSize = maxSize;
  }

  /**
   * Adiciona um elemento ao topo da pilha
   */
  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      // Remove o elemento mais antigo para manter o limite
      this.items.shift();
    }
    this.items.push(item);
  }

  /**
   * Remove e retorna o elemento do topo da pilha
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Retorna o elemento do topo sem removê-lo
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Verifica se a pilha está vazia
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Retorna o tamanho atual da pilha
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Limpa todos os elementos da pilha
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Retorna uma cópia dos elementos da pilha
   */
  toArray(): T[] {
    return [...this.items];
  }
}

/**
 * Gerenciador de histórico de edição usando duas pilhas:
 * - undoStack: estados anteriores (para desfazer)
 * - redoStack: estados futuros (para refazer)
 */
export class HistoryManager {
  private undoStack: Stack<EditorState>;
  private redoStack: Stack<EditorState>;
  private currentState: EditorState | null;
  private debounceTimer: number | null;
  private debounceDelay: number;
  private onChangeCallback: ((canUndo: boolean, canRedo: boolean) => void) | null;

  constructor(maxHistorySize: number = 100, debounceDelay: number = 500) {
    this.undoStack = new Stack(maxHistorySize);
    this.redoStack = new Stack(maxHistorySize);
    this.currentState = null;
    this.debounceTimer = null;
    this.debounceDelay = debounceDelay;
    this.onChangeCallback = null;
  }

  /**
   * Registra um callback para notificar mudanças no estado de undo/redo
   */
  onStateChange(callback: (canUndo: boolean, canRedo: boolean) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Notifica o callback sobre mudanças
   */
  private notifyStateChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.canUndo(), this.canRedo());
    }
  }

  /**
   * Captura o estado atual do editor
   */
  captureState(content: string, selectionStart: number, selectionEnd: number): void {
    const newState: EditorState = {
      content,
      selectionStart,
      selectionEnd,
      timestamp: Date.now()
    };

    // Se já existe um estado atual, salva na pilha de undo
    if (this.currentState) {
      // Debounce para evitar múltiplos estados em edições rápidas
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        this.undoStack.push(this.currentState!);
        this.redoStack.clear(); // Limpa redo ao fazer nova edição
        this.currentState = newState;
        this.notifyStateChange();
        this.debounceTimer = null;
      }, this.debounceDelay);
    } else {
      this.currentState = newState;
    }
  }

  /**
   * Captura estado imediatamente (sem debounce)
   */
  captureStateImmediate(content: string, selectionStart: number, selectionEnd: number): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.currentState) {
      this.undoStack.push(this.currentState);
      this.redoStack.clear();
    }

    this.currentState = {
      content,
      selectionStart,
      selectionEnd,
      timestamp: Date.now()
    };

    this.notifyStateChange();
  }

  /**
   * Desfaz a última ação
   */
  undo(): EditorState | null {
    if (!this.canUndo()) {
      return null;
    }

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Estado atual vai para a pilha de redo
    if (this.currentState) {
      this.redoStack.push(this.currentState);
    }

    // Pega o último estado da pilha de undo
    this.currentState = this.undoStack.pop() || null;
    this.notifyStateChange();

    return this.currentState;
  }

  /**
   * Refaz a última ação desfeita
   */
  redo(): EditorState | null {
    if (!this.canRedo()) {
      return null;
    }

    // Estado atual vai para a pilha de undo
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }

    // Pega o último estado da pilha de redo
    this.currentState = this.redoStack.pop() || null;
    this.notifyStateChange();

    return this.currentState;
  }

  /**
   * Verifica se é possível desfazer
   */
  canUndo(): boolean {
    return !this.undoStack.isEmpty() && this.currentState !== null;
  }

  /**
   * Verifica se é possível refazer
   */
  canRedo(): boolean {
    return !this.redoStack.isEmpty();
  }

  /**
   * Retorna o estado atual
   */
  getCurrentState(): EditorState | null {
    return this.currentState;
  }

  /**
   * Retorna o tamanho do histórico de undo
   */
  getUndoSize(): number {
    return this.undoStack.size();
  }

  /**
   * Retorna o tamanho do histórico de redo
   */
  getRedoSize(): number {
    return this.redoStack.size();
  }

  /**
   * Limpa todo o histórico
   */
  clear(): void {
    this.undoStack.clear();
    this.redoStack.clear();
    this.currentState = null;
    this.notifyStateChange();
  }
}

// Exporta uma instância singleton
export const historyManager = new HistoryManager();