// Ferramentas da página de apresentação: recortam trechos do código-fonte
// real do projeto e o dividem em "tokens" para colorir. Assim os exemplos da
// página nunca ficam diferentes do código que está rodando.

export type TipoToken =
  | "palavra"
  | "texto"
  | "numero"
  | "comentario"
  | "funcao"
  | "tipo"
  | "simples";

export interface Token {
  tipo: TipoToken;
  valor: string;
}

export interface Trecho {
  // Número (começando em 1) da primeira linha do trecho no arquivo original
  inicio: number;
  linhas: string[];
}

export interface Linha {
  numero: number;
  tokens: Token[];
}

const PALAVRAS = new Set([
  "as", "async", "await", "break", "case", "class", "const", "continue",
  "default", "else", "export", "extends", "false", "for", "from", "function",
  "if", "import", "in", "new", "null", "of", "private", "readonly", "return",
  "static", "switch", "this", "true", "type", "undefined", "while",
]);

const PRIMITIVOS = new Set(["string", "number", "boolean", "void", "unknown", "never"]);

// Ordem das alternativas: comentário, texto entre aspas, número, identificador
const PADRAO =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

export function tokenizar(linha: string): Token[] {
  const tokens: Token[] = [];
  let ultimo = 0;
  for (const m of linha.matchAll(PADRAO)) {
    const inicio = m.index;
    if (inicio > ultimo) {
      tokens.push({ tipo: "simples", valor: linha.slice(ultimo, inicio) });
    }
    const [valor, comentario, texto, numero] = m;
    ultimo = inicio + valor.length;

    let tipo: TipoToken;
    if (comentario !== undefined) tipo = "comentario";
    else if (texto !== undefined) tipo = "texto";
    else if (numero !== undefined) tipo = "numero";
    else if (PALAVRAS.has(valor)) tipo = "palavra";
    else if (PRIMITIVOS.has(valor) || /^[A-Z]/.test(valor)) tipo = "tipo";
    else if (/^(<[^>()]*>)?\(/.test(linha.slice(ultimo))) tipo = "funcao";
    else tipo = "simples";
    tokens.push({ tipo, valor });
  }
  if (ultimo < linha.length) {
    tokens.push({ tipo: "simples", valor: linha.slice(ultimo) });
  }
  return tokens;
}

function dividirLinhas(fonte: string): string[] {
  return fonte.split(/\r?\n/);
}

// Conta chaves fora de textos e comentários
function contarChaves(linha: string): { abre: number; fecha: number } {
  let abre = 0;
  let fecha = 0;
  for (const t of tokenizar(linha)) {
    if (t.tipo !== "simples") continue;
    for (const c of t.valor) {
      if (c === "{") abre++;
      else if (c === "}") fecha++;
    }
  }
  return { abre, fecha };
}

// Arquivo inteiro, sem as linhas vazias do final
export function extrairArquivo(fonte: string): Trecho {
  const linhas = dividirLinhas(fonte);
  while (linhas.length > 0 && linhas[linhas.length - 1].trim() === "") linhas.pop();
  return { inicio: 1, linhas };
}

// Começa na primeira linha que contém "ancora" e vai até a chave que fecha o bloco
export function extrairBloco(fonte: string, ancora: string): Trecho {
  const todas = dividirLinhas(fonte);
  const inicio = todas.findIndex((l) => l.includes(ancora));
  if (inicio === -1) {
    console.error(`Trecho não encontrado no código-fonte: "${ancora}"`);
    return { inicio: 1, linhas: [] };
  }
  let saldo = 0;
  let abriu = false;
  let fim = inicio;
  for (let i = inicio; i < todas.length; i++) {
    const { abre, fecha } = contarChaves(todas[i]);
    if (abre > 0) abriu = true;
    saldo += abre - fecha;
    fim = i;
    if (abriu && saldo <= 0) break;
  }
  return { inicio: inicio + 1, linhas: todas.slice(inicio, fim + 1) };
}

// Gera as linhas prontas para exibir. Os números continuam sendo os do arquivo
// original, mesmo quando linhas de comentário são escondidas.
export function prepararLinhas(trecho: Trecho, mostrarComentarios: boolean): Linha[] {
  const resultado: Linha[] = [];
  trecho.linhas.forEach((texto, i) => {
    let tokens = tokenizar(texto);
    if (!mostrarComentarios && tokens.some((t) => t.tipo === "comentario")) {
      tokens = tokens.filter((t) => t.tipo !== "comentario");
      const ultimo = tokens[tokens.length - 1];
      if (ultimo?.tipo === "simples") ultimo.valor = ultimo.valor.trimEnd();
      tokens = tokens.filter((t) => t.valor !== "");
      if (tokens.length === 0) return; // a linha só tinha comentário
    }
    resultado.push({ numero: trecho.inicio + i, tokens });
  });
  return resultado;
}
