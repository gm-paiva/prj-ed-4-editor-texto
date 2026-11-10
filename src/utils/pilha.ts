// Pilha (FILO) imutável, no estilo do Cap. 4.3.
// Cada operação devolve uma nova pilha, o que combina com o useState do React.
export class Pilha<T> {
  private readonly itens: readonly T[];
  private readonly limite: number;

  private constructor(itens: readonly T[], limite: number) {
    this.itens = itens;
    this.limite = limite;
  }

  static vazia<T>(limite = 100): Pilha<T> {
    return new Pilha<T>([], limite);
  }

  empilhar(item: T): Pilha<T> {
    const novos = [...this.itens, item];
    // Se passar do limite, descarta o mais antigo (base da pilha)
    const cortados = novos.length > this.limite ? novos.slice(-this.limite) : novos;
    return new Pilha<T>(cortados, this.limite);
  }

  desempilhar(): { pilha: Pilha<T>; item: T | undefined } {
    if (this.itens.length === 0) return { pilha: this, item: undefined };
    return {
      pilha: new Pilha<T>(this.itens.slice(0, -1), this.limite),
      item: this.itens[this.itens.length - 1],
    };
  }

  topo(): T | undefined {
    return this.itens[this.itens.length - 1];
  }

  estaVazia(): boolean {
    return this.itens.length === 0;
  }

  tamanho(): number {
    return this.itens.length;
  }

  limpar(): Pilha<T> {
    return new Pilha<T>([], this.limite);
  }
}