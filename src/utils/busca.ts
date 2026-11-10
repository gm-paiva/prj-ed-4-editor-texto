function normalizar(s: string, diferenciarCaixa: boolean): string {
  return diferenciarCaixa ? s : s.toLowerCase();
}

// Busca trivial: tenta casar o padrão em cada posição do texto
export function buscarTrivial(
  texto: string,
  palavra: string,
  diferenciarCaixa = false
): number[] {
  if (!palavra) return [];
  const t = normalizar(texto, diferenciarCaixa);
  const p = normalizar(palavra, diferenciarCaixa);
  const posicoes: number[] = [];

  for (let i = 0; i <= t.length - p.length; i++) {
    let j = 0;
    while (j < p.length && t[i + j] === p[j]) j++;
    if (j === p.length) posicoes.push(i);
  }
  return posicoes;
}

// Boyer-Moore (heurística do caractere ruim): compara da direita para a
// esquerda e, na falha, salta usando a última posição do caractere no padrão.
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
      s += 1;
    } else {
      const k = ultima.get(t[s + j]) ?? -1;
      s += Math.max(1, j - k);
    }
  }
  return posicoes;
}

export interface ResultadoSubstituicao {
  texto: string;
  cursor: number; // posição logo após o trecho substituído
  substituido: boolean;
}

// Substitui só a próxima ocorrência a partir do cursor (ou a primeira do texto)
export function substituirUma(
  texto: string,
  palavra: string,
  nova: string,
  aPartirDe = 0,
  diferenciarCaixa = false
): ResultadoSubstituicao {
  const posicoes = buscarBoyerMoore(texto, palavra, diferenciarCaixa);
  const alvo = posicoes.find((p) => p >= aPartirDe) ?? posicoes[0];
  if (alvo === undefined) {
    return { texto, cursor: aPartirDe, substituido: false };
  }
  return {
    texto: texto.slice(0, alvo) + nova + texto.slice(alvo + palavra.length),
    cursor: alvo + nova.length,
    substituido: true,
  };
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
    if (p < ultimo) continue; // ignora ocorrências sobrepostas
    resultado += texto.slice(ultimo, p) + nova;
    ultimo = p + palavra.length;
  }
  return resultado + texto.slice(ultimo);
}