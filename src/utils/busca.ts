// Boyer-Moore — Heurística do Caractere Ruim
// ------------------------------------------------------------
// Conceito: Busca eficiente de padrão em texto.
// Diferença do naïve: compara DA DIREITA PARA A ESQUERDA.
// Quando há mismatch (caractere ruim), usa tabela pré-calculada para SALTAR
// várias posições de uma vez — evita comparações desnecessárias.
//
// Melhor caso: O(n/m) — inspeciona ~1 caractere a cada m do texto.
// Pior caso: O(n*m) — mas raro na prática.
// Tabela "última ocorrência": para cada caractere do padrão, guarda
// o índice MAIS À DIREITA onde ele aparece.
//
// Exemplo: padrão "pato" em "o sapo viu o pato"
// - Tabela: p→0, a→1, t→2, o→3
// - Compara da direita: 'o' vs 'o' ✓, 't' vs 't' ✓, 'a' vs 'a' ✓, 'p' vs 'p' ✓ → ACHOU!
// - Se falhasse no 'x' (não está no padrão), saltaria 4 posições (tamanho do padrão).

export function buscaBoyerMoore(
  texto: string,
  palavra: string
): number[] {
  if (!palavra) return [];

  // Busca case-insensitive: normaliza ambos para minúsculas
  const t = texto.toLowerCase();
  const p = palavra.toLowerCase();
  const n = t.length;
  const m = p.length;

  // TABELA DE ÚLTIMA OCORRÊNCIA (heurística do caractere ruim)
  // Map<caractere, índice mais à direita no padrão>
  // Permite calcular o salto quando há mismatch
  const ultima = new Map<string, number>();
  for (let i = 0; i < m; i++) ultima.set(p[i], i);

  const posicoes: number[] = [];
  let s = 0; // deslocamento do padrão sobre o texto

  while (s <= n - m) {
    // COMPARAÇÃO REVERSA: da direita para a esquerda (j = m-1 → 0)
    let j = m - 1;
    while (j >= 0 && p[j] === t[s + j]) j--;

    if (j < 0) {
      // MATCH COMPLETO: todos os caracteres bateram
      posicoes.push(s);
      s += m; // avança após o padrão (sem sobreposição)
    } else {
      // MISMATCH em posição j
      // t[s+j] é o "caractere ruim" do texto
      // Consulta tabela: onde esse caractere aparece por último no padrão?
      const k = ultima.get(t[s + j]) ?? -1; // -1 se não existe no padrão

      // SALTO INTELIGENTE:
      // Alinha a última ocorrência do caractere ruim no padrão
      // com a posição dele no texto.
      // Math.max(1, j - k) garante avanço mínimo de 1.
      s += Math.max(1, j - k);
    }
  }
  return posicoes;
}

// SUBSTITUIR UMA OCORRÊNCIA
// Corte cirúrgico: antes + nova + depois
// posicao = índice inicial da ocorrência (vindo de buscaBoyerMoore)
// tamanho = palavra.length (tamanho do trecho a substituir)
export function substituirOcorrencia(
  texto: string,
  posicao: number,
  tamanho: number,
  nova: string
): string {
  return texto.slice(0, posicao) + nova + texto.slice(posicao + tamanho);
}

// SUBSTITUIR TODAS
// Reconstrói a string de uma só passada (O(n)):
// - Itera posições encontradas
// - Acumula: trecho original entre ocorrências + substituição
// - Evita replace encadeado que realocaria string a cada iteração
export function substituirTodas(
  texto: string,
  palavra: string,
  nova: string
): string {
  const posicoes = buscaBoyerMoore(texto, palavra);
  let resultado = "";
  let ultimo = 0;
  for (const p of posicoes) {
    resultado += texto.slice(ultimo, p) + nova;
    ultimo = p + palavra.length;
  }
  return resultado + texto.slice(ultimo);
}