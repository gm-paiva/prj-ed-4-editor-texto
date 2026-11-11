function normalizar(s: string, diferenciarCaixa: boolean): string {
  return diferenciarCaixa ? s : s.toLowerCase();
}

// Boyer-Moore (heurística do caractere ruim): compara da direita para a
// esquerda e, na falha, salta usando a última posição do caractere no padrão.
// Devolve a posição inicial de cada ocorrência, em ordem crescente e sem
// sobreposição (depois de um acerto, continua depois do trecho encontrado).
export function buscarBoyerMoore(
  texto: string,
  palavra: string,
  diferenciarCaixa = false
): number[] {
  if (!palavra) return [];
  const t = normalizar(texto, diferenciarCaixa);
  const p = normalizar(palavra, diferenciarCaixa);
  const n = t.length;
  const m = p.length;

  const ultima = new Map<string, number>();
  for (let i = 0; i < m; i++) ultima.set(p[i], i);

  const posicoes: number[] = [];
  let s = 0;
  while (s <= n - m) {
    let j = m - 1;
    while (j >= 0 && p[j] === t[s + j]) j--;
    if (j < 0) {
      posicoes.push(s);
      s += m;
    } else {
      const k = ultima.get(t[s + j]) ?? -1;
      s += Math.max(1, j - k);
    }
  }
  return posicoes;
}

// Substitui uma única ocorrência: a que começa em "posicao" (um dos valores
// devolvidos por buscarBoyerMoore) e tem "tamanho" caracteres.
export function substituirOcorrencia(
  texto: string,
  posicao: number,
  tamanho: number,
  nova: string
): string {
  return texto.slice(0, posicao) + nova + texto.slice(posicao + tamanho);
}

// Substitui todas, usando a lista inteira de posições
export function substituirTodas(
  texto: string,
  palavra: string,
  nova: string,
  diferenciarCaixa = false
): string {
  const posicoes = buscarBoyerMoore(texto, palavra, diferenciarCaixa);
  let resultado = "";
  let ultimo = 0;
  for (const p of posicoes) {
    resultado += texto.slice(ultimo, p) + nova;
    ultimo = p + palavra.length;
  }
  return resultado + texto.slice(ultimo);
}
