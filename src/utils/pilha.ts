// Pilha (FILO - First In, Last Out) imutável
// ------------------------------------------------------------
// Conceito: Estrutura linear onde o último elemento inserido é o primeiro a sair.
// Analogia: pilha de pratos — só se remove o do topo.
// No editor: duas pilhas sincronizadas implementam Desfazer/Refazer.
// - Pilha "desfazer" guarda o PASSADO (estados anteriores)
// - Pilha "refazer" guarda o FUTURO (estados desfeitos, prontos para voltar)
// Imutabilidade: cada operação retorna NOVA instância (compatível com useState React)

export class Pilha<T> {
  private readonly itens: readonly T[];
  private readonly limite: number;

  private constructor(itens: readonly T[], limite: number) {
    this.itens = itens;
    this.limite = limite;
  }

  // Fábrica: cria pilha vazia com limite opcional (default 100)
  static vazia<T>(limite = 100): Pilha<T> {
    return new Pilha<T>([], limite);
  }

  // EMPilhar (push): adiciona item no TOPO
  // - Cria novo array com item no final [...itens, item]
  // - Se exceder limite, descarta o MAIS ANTIGO (base da pilha) via slice(-limite)
  // - Retorna NOVA Pilha (imutabilidade)
  empilhar(item: T): Pilha<T> {
    const novos = [...this.itens, item];
    const cortados = novos.length > this.limite ? novos.slice(-this.limite) : novos;
    return new Pilha<T>(cortados, this.limite);
  }

  // DESempilhar (pop): remove e devolve item do TOPO
  // - Se vazia, retorna { pilha: this, item: undefined }
  // - Senão: nova pilha sem o último item (slice(0, -1)) + item removido
  // - Retorna objeto com a nova pilha e o item removido
  desempilhar(): { pilha: Pilha<T>; item: T | undefined } {
    if (this.itens.length === 0) return { pilha: this, item: undefined };
    return {
      pilha: new Pilha<T>(this.itens.slice(0, -1), this.limite),
      item: this.itens[this.itens.length - 1],
    };
  }

  // TOPO (peek): consulta item do topo SEM remover
  // Útil para "espiar" o que será desfeito sem alterar estado
  topo(): T | undefined {
    return this.itens[this.itens.length - 1];
  }

  estaVazia(): boolean {
    return this.itens.length === 0;
  }

  tamanho(): number {
    return this.itens.length;
  }

  // Limpa a pilha mantendo o mesmo limite
  limpar(): Pilha<T> {
    return new Pilha<T>([], this.limite);
  }
}