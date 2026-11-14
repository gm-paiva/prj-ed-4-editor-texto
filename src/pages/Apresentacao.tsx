import { useEffect, useState } from "react";
import { extrairBloco, type Trecho } from "../utils/codigo";
import BlocoCodigo from "./BlocoCodigo";
import "./Apresentacao.css";

// Código-fonte lido dos arquivos do projeto (?raw)
import buscaFonte from "../utils/busca.ts?raw";
import exportarPdfFonte from "../utils/exportarPdf.ts?raw";
import pilhaFonte from "../utils/pilha.ts?raw";
import historicoFonte from "../hooks/useHistorico.ts?raw";

// Imagens conceituais (diagramas e ilustrações, não prints do editor)
import imgPilha from "../assets/apresentacao/pilha.svg";
import imgBoyerMoore from "../assets/apresentacao/boyer-moore.svg";
import imgSubstituicao from "../assets/apresentacao/substituicao.svg";
import imgHistorico from "../assets/apresentacao/historico.svg";
import imgPdf from "../assets/apresentacao/pdf.svg";
import imgEnunciado from "../assets/apresentacao/enunciado.png";

const REPOSITORIO = "https://github.com/gm-paiva/prj-ed-4-editor-texto";
const TECNOLOGIAS = ["TypeScript", "React", "Vite", "jsPDF"];

interface ConceitoVisual {
  id: string;
  titulo: string;
  capitulo: string;
  // Explicação conceitual (texto principal da seção)
  explicacao: string;
  // Passos visuais do algoritmo/fluxo
  passos: { titulo: string; descricao: string }[];
  // Trecho de código representativo (apenas o essencial)
  codigo: { arquivo: string; trecho: Trecho; foco: string } | null;
  // Imagem/diagrama ilustrativo
  imagem: { src: string; alt: string; legenda: string } | null;
  // "Você sabia?" ou insight didático
  insight?: string;
}

const conceitos: ConceitoVisual[] = [
  {
    id: "pilha",
    titulo: "Pilha (FILO)",
    capitulo: "Cap. 4.3",
    explicacao:
      "A pilha é uma estrutura de dados linear que segue o princípio **FILO** (First In, Last Out): o primeiro elemento a entrar é o último a sair. Pense numa pilha de pratos — você só consegue retirar o que está no topo. No editor, usamos **duas pilhas** para implementar desfazer/refazer: uma guarda o passado (ações para desfazer) e outra guarda o futuro (ações desfeitas, prontas para refazer).",
    passos: [
      {
        titulo: "Empilhar (push)",
        descricao: "Adiciona um elemento no topo. O elemento anterior desce um nível.",
      },
      {
        titulo: "Desempilhar (pop)",
        descricao: "Remove e devolve o elemento do topo. O elemento abaixo vira o novo topo.",
      },
      {
        titulo: "Topo (peek)",
        descricao: "Consulta o elemento do topo sem removê-lo — útil para ver o que será desfeito.",
      },
    ],
    codigo: {
      arquivo: "src/utils/pilha.ts",
      trecho: extrairBloco(pilhaFonte, "export class Pilha"),
      foco: "Métodos empilhar, desempilhar e topo — núcleo da estrutura FILO",
    },
    imagem: {
      src: imgPilha,
      alt: "Diagrama de pilha: itens A, B, C empilhados; seta mostrando remoção do C (topo)",
      legenda: "Operações básicas: empilhar A → empilhar B → empilhar C → desempilhar (retorna C)",
    },
    insight:
      "A imutabilidade da pilha (cada operação retorna nova instância) combina perfeitamente com o useState do React — o estado novo substitui o antigo sem mutação.",
  },
  {
    id: "desfazer-refazer",
    titulo: "Desfazer / Refazer com Duas Pilhas",
    capitulo: "Cap. 4.3",
    explicacao:
      "O segredo do desfazer/refazer está em **duas pilhas sincronizadas**: a pilha **desfazer** guarda o histórico de estados anteriores; a pilha **refazer** guarda os estados que foram desfeitos. Ao digitar, o estado atual vai para 'desfazer' e 'refazer' é limpa. Ao desfazer, o topo de 'desfazer' volta a ser o texto atual e o estado anterior vai para 'refazer'. Ao refazer, o inverso acontece.",
    passos: [
      {
        titulo: "Digitar algo novo",
        descricao: "Estado atual → empilha em 'desfazer'; 'refazer' esvazia.",
      },
      {
        titulo: "Ctrl+Z (Desfazer)",
        descricao: "Topo de 'desfazer' → texto atual; estado anterior → empilha em 'refazer'.",
      },
      {
        titulo: "Ctrl+Y (Refazer)",
        descricao: "Topo de 'refazer' → texto atual; estado anterior → empilha em 'desfazer'.",
      },
      {
        titulo: "Nova digitação após desfazer",
        descricao: "'Refazer' é limpa — o futuro alternativo deixa de existir.",
      },
    ],
    codigo: {
      arquivo: "src/hooks/useHistorico.ts",
      trecho: extrairBloco(historicoFonte, "export function useHistorico"),
      foco: "Funções alterar, desfazerAcao e refazerAcao — sincronismo das duas pilhas",
    },
    imagem: {
      src: imgHistorico,
      alt: "Tabela de histórico mostrando ações (alterar, desfazerAcao, refazerAcao) com colunas para texto atual, pilha desfazer e pilha refazer, ilustrando a migração de itens entre as duas pilhas",
      legenda: "Exemplo passo a passo: digitar 'a' → 'ab' → 'abc'; desfazer duas vezes → 'a'; refazer → 'ab'; nova edição 'abx' limpa refazer",
    },
    insight:
      "O atalho Ctrl+Z nativo do navegador é interceptado (e.preventDefault()) para não conflitar com nossas duas pilhas controladas.",
  },
  {
    id: "boyer-moore",
    titulo: "Busca Boyer-Moore (Heurística do Caractere Ruim)",
    capitulo: "Cap. 3.2",
    explicacao:
      "O algoritmo **Boyer-Moore** procura uma palavra no texto comparando **da direita para a esquerda**. Quando encontra um caractere que não bate (o 'caractere ruim'), ele consulta uma tabela pré-calculada com a **última posição de cada caractere no padrão** e salta várias posições de uma vez. Isso evita comparações desnecessárias — no melhor caso, inspeciona apenas 1 em cada *m* caracteres (onde *m* é o tamanho da palavra).",
    passos: [
      {
        titulo: "Pré-processamento",
        descricao: "Constrói tabela 'última ocorrência' para cada caractere do padrão.",
      },
      {
        titulo: "Comparação reversa",
        descricao: "Compara padrão com texto da direita para a esquerda.",
      },
      {
        titulo: "Mismatch → salto inteligente",
        descricao: "Caractere do texto não bate? Consulta tabela e pula para alinhar última ocorrência.",
      },
      {
        titulo: "Match completo",
        descricao: "Todos os caracteres bateram → registra posição e avança após o padrão.",
      },
    ],
    codigo: {
      arquivo: "src/utils/busca.ts",
      trecho: extrairBloco(buscaFonte, "export function buscaBoyerMoore"),
      foco: "Laço while com comparação reversa (j--) e salto via tabela 'ultima'",
    },
    imagem: {
      src: imgBoyerMoore,
      alt: "Passo a passo visual: procurando 'pato' em 'o sapo viu o pato' com setas de salto",
      legenda: "Exemplo: busca 'pato' — ao falhar no 'o', pula 4 posições usando a tabela",
    },
    insight:
      "Diferente do naïve (que volta 1 a 1), Boyer-Moore pode pular o padrão inteiro quando o caractere ruim não existe no padrão — daí a eficiência O(n/m) no melhor caso.",
  },
  {
    id: "substituicao",
    titulo: "Substituir Uma / Todas",
    capitulo: "Cap. 3.2",
    explicacao:
      "A substituição usa as posições encontradas pelo Boyer-Moore. **Substituir uma** troca apenas a ocorrência selecionada (a destacada em laranja) e avança a seleção para a próxima. **Substituir todas** percorre a lista de posições de trás para frente (ou constrói nova string acumulando trechos) para que os índices não se desloquem durante a troca.",
    passos: [
      {
        titulo: "Buscar posições",
        descricao: "buscaBoyerMoore devolve array com índice inicial de cada ocorrência.",
      },
      {
        titulo: "Substituir uma",
        descricao: "Corta string em 3 partes: antes + nova + depois da posição selecionada.",
      },
      {
        titulo: "Substituir todas",
        descricao: "Itera posições e concatena: trecho original + substituição, sem sobrepor.",
      },
      {
        titulo: "Atualizar seleção",
        descricao: "Após substituir uma, busca novamente para achar a próxima ocorrência válida.",
      },
    ],
    codigo: {
      arquivo: "src/utils/busca.ts",
      trecho: extrairBloco(buscaFonte, "export function substituirOcorrencia"),
      foco: "substituirOcorrencia (corte cirúrgico) e substituirTodas (reconstrução completa)",
    },
    imagem: {
      src: imgSubstituicao,
      alt: "Exemplo visual: texto 'o gato e o gato' com posições [2, 11]; acima substitui uma ocorrência (laranja), abaixo substitui todas (azul)",
      legenda: "substituirOcorrencia (corte cirúrgico) vs substituirTodas (reconstrução completa mantendo índices estáveis)",
    },
    insight:
      "substituirTodas reconstrói a string de uma vez (O(n)) em vez de encadear replaces — evita realocações intermediárias e mantém índices estáveis.",
  },
  {
    id: "jspdf",
    titulo: "Exportação PDF com jsPDF",
    capitulo: "Biblioteca",
    explicacao:
      "A biblioteca **jsPDF** gera PDFs no lado do cliente (browser). O texto é dividido em linhas que cabem na largura útil da página (A4 menos margens). Quando a linha seguinte ultrapassa a margem inferior, uma **nova página** é criada automaticamente. O espaçamento entre linhas (leading) é fixo em 7 unidades para legibilidade.",
    passos: [
      {
        titulo: "Criar documento",
        descricao: "new jsPDF() — página A4 retrato por padrão.",
      },
      {
        titulo: "Calcular largura útil",
        descricao: "pageWidth - 2 × margem (ex.: 210mm - 30mm = 180mm).",
      },
      {
        titulo: "Quebrar texto em linhas",
        descricao: "splitTextToSize(texto, larguraUtil) — respeita palavras, não corta no meio.",
      },
      {
        titulo: "Desenhar linha a linha",
        descricao: "doc.text(linha, margem, y); y += 7; se y > altura - margem → addPage().",
      },
      {
        titulo: "Salvar",
        descricao: "doc.save('nome.pdf') — dispara download no navegador.",
      },
    ],
    codigo: {
      arquivo: "src/utils/exportarPdf.ts",
      trecho: extrairBloco(exportarPdfFonte, "export function exportarPdf"),
      foco: "Loop de linhas com verificação de quebra de página (y > altura - margem)",
    },
    imagem: {
      src: imgPdf,
      alt: "Duas páginas A4 lado a lado mostrando margens, largura útil, leading de 7 e quebra de página",
      legenda: "Layout: margem 15, largura útil ~180mm, leading 7, quebra automática no rodapé",
    },
    insight:
      "splitTextToSize já cuida da quebra de palavras longas — não precisamos implementar hyphenation manual.",
  },
];

function irPara(id: string) {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
}

export default function Apresentacao() {
  const [mostrarCodigos, setMostrarCodigos] = useState(false);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Apresentação · Editor de Texto";
    return () => {
      document.title = tituloAnterior;
    };
  }, []);

  return (
    <div className="apresentacao">
      <div className="apresentacao-barra">
        <a className="voltar" href="#/">
          ← Voltar ao editor
        </a>
        <a className="externo" href={REPOSITORIO} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>

      <header className="hero">
        <p className="selo">PRJ.ED.4 · FATEC</p>
        <h1>Editor de Texto</h1>
        <ul className="tecnologias" aria-label="Tecnologias">
          {TECNOLOGIAS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <nav className="indice" aria-label="Conceitos">
          {conceitos.map((c, i) => (
            <button key={c.id} onClick={() => irPara(c.id)}>
              <span>{String(i + 1).padStart(2, "0")}</span> {c.titulo}
            </button>
          ))}
        </nav>
        <figure className="imagem hero-img">
          <img
            src={imgEnunciado}
            alt="Enunciado do projeto PRJ.ED.4: editor de texto com fazer e desfazer ações, substituir uma ou todas as ocorrências de uma palavra, interface Web e exportação em PDF"
          />
        </figure>
      </header>

      <div className="toggle-codigos">
        <button
          onClick={() => setMostrarCodigos(!mostrarCodigos)}
          className={mostrarCodigos ? "ativo" : ""}
        >
          {mostrarCodigos ? "Ocultar código" : "Mostrar código"} fonte
        </button>
        <span className="dica">Os conceitos vêm primeiro; o código ilustra.</span>
      </div>

      {conceitos.map((c, i) => (
        <section className="conceito" id={c.id} key={c.id} aria-labelledby={`${c.id}-titulo`}>
          <header className="conceito-topo">
            <span className="conceito-num">{String(i + 1).padStart(2, "0")}</span>
            <h2 id={`${c.id}-titulo`}>{c.titulo}</h2>
            <span className="conceito-cap">{c.capitulo}</span>
          </header>

          {/* Explicação conceitual principal */}
          <div className="explicacao">
            <p dangerouslySetInnerHTML={{ __html: c.explicacao }} />
          </div>

          {/* Passos visuais do algoritmo/fluxo */}
          <div className="passos">
            {c.passos.map((passo, idx) => (
              <div className="passo" key={idx}>
                <span className="passo-num">{idx + 1}</span>
                <div className="passo-conteudo">
                  <strong>{passo.titulo}</strong>
                  <p>{passo.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Insight didático */}
          {c.insight && (
            <div className="insight">
              <span className="insight-icon">💡</span>
              <p>{c.insight}</p>
            </div>
          )}

          {/* Imagem/diagrama ilustrativo */}
          {c.imagem && (
            <div className="imagem-wrapper">
              <figure className="imagem">
                <img src={c.imagem.src} alt={c.imagem.alt} />
                <figcaption>{c.imagem.legenda}</figcaption>
              </figure>
            </div>
          )}

          {/* Código fonte (opcional, colapsável) */}
          {mostrarCodigos && c.codigo && (
            <div className="codigos">
              <BlocoCodigo
                arquivo={c.codigo.arquivo}
                trecho={c.codigo.trecho}
                mostrarComentarios={false}
              />
              <p className="codigo-foco">🔍 Foco: {c.codigo.foco}</p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}