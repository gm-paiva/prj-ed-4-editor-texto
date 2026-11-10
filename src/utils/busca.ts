// Retorna a lista de posições onde a palavra aparece (busca trivial)
export function boyerMoore(
  texto: string,
  palavra: string,
  diferenciarCaixa = false
): number[] {
  if (!palavra) return [];
  const t = diferenciarCaixa ? texto : texto.toLowerCase();
  const p = diferenciarCaixa ? palavra : palavra.toLowerCase();
  const posicoes: number[] = [];

  for (let i = 0; i <= t.length - p.length; i++) {
    let j = 0;
    while (j < p.length && t[i + j] === p[j]) j++;
    if (j === p.length) posicoes.push(i);
  }
  return posicoes;
}

// Substitui só a primeira ocorrência a partir do cursor (ou a primeira do texto)
export function substituirUma(
  texto: string,
  palavra: string,
  nova: string,
  aPartirDe = 0,
  diferenciarCaixa = false
): string {
  const posicoes = boyerMoore(texto, palavra, diferenciarCaixa);
  const alvo = posicoes.find((p) => p >= aPartirDe) ?? posicoes[0];
  if (alvo === undefined) return texto;
  return texto.slice(0, alvo) + nova + texto.slice(alvo + palavra.length);
}

// Substitui todas, usando a lista inteira de posições
export function substituirTodas(
  texto: string,
  palavra: string,
  nova: string,
  diferenciarCaixa = false
): string {
  const posicoes = boyerMoore(texto, palavra, diferenciarCaixa);
  let resultado = "";
  let ultimo = 0;
  for (const p of posicoes) {
    if (p < ultimo) continue; // ignora ocorrências sobrepostas
    resultado += texto.slice(ultimo, p) + nova;
    ultimo = p + palavra.length;
  }
  return resultado + texto.slice(ultimo);
}