import { useEffect } from "react";
import { extrairArquivo, extrairBloco, type Trecho } from "../utils/codigo";
import BlocoCodigo from "./BlocoCodigo";
import "./Apresentacao.css";

// O código exibido aqui é lido dos próprios arquivos do projeto (?raw)
import appFonte from "../App.tsx?raw";
import historicoFonte from "../hooks/useHistorico.ts?raw";
import buscaFonte from "../utils/busca.ts?raw";
import exportarPdfFonte from "../utils/exportarPdf.ts?raw";
import pilhaFonte from "../utils/pilha.ts?raw";

import imgBoyerMoore from "../assets/apresentacao/boyer-moore.svg";
import imgBusca from "../assets/apresentacao/busca.png";
import imgEnunciado from "../assets/apresentacao/enunciado.png";
import imgHistorico from "../assets/apresentacao/historico.svg";
import imgHistorico1 from "../assets/apresentacao/historico-1.png";
import imgHistorico2 from "../assets/apresentacao/historico-2.png";
import imgPdf from "../assets/apresentacao/pdf.svg";
import imgPilha from "../assets/apresentacao/pilha.svg";
import imgSubstituicao from "../assets/apresentacao/substituicao.svg";
import imgSubstituirTodas from "../assets/apresentacao/substituir-todas.png";
import imgSubstituirUma from "../assets/apresentacao/substituir-uma.png";

// Mude para true para mostrar também os comentários que estão no código
const MOSTRAR_COMENTARIOS = false;

const REPOSITORIO = "https://github.com/gm-paiva/prj-ed-4-editor-texto";
const TECNOLOGIAS = ["TypeScript", "React", "Vite", "jsPDF"];

/** Converte **negrito** markdown para <strong> HTML */
function markdownNegrito(texto: string): string {
  return texto.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

interface ConceitoVisual {
  id: string;
  titulo: string;
  capitulo: string;
  explicacao: string;
  passos: { titulo: string; descricao: string }[];
  codigo: { arquivo: string; trecho: Trecho; foco: string } | null;
  imagem: { src: string; alt: string; legenda: string } | null;
}

const conceitos: Conceito[] = [
  {
    id: "pilha",
    titulo: "Pilha (FILO)",
    capitulo: "Cap. 4.3",
    explicacao:
      "A pilha é uma estrutura de dados linear que segue o princípio **FILO** (First In, Last Out): o primeiro elemento a entrar é o último a sair. Pense numa pilha de pratos — você só consegue retirar o que está no topo. No editor, usamos **duas pilhas** para implementar desfazer/refazer: uma guarda o passado (ações para desfazer) e outra guarda o futuro (ações desfeitas, prontas para refazer).",
    passos: [
      {
        titulo: "Empilhar",
        descricao: "Adiciona um elemento no topo. O elemento anterior desce um nível.",
      },
      {
        titulo: "Desempilhar",
        descricao: "Remove e devolve o elemento do topo. O elemento abaixo vira o novo topo.",
      },
    ],
    imagens: [
      {
        titulo: "Topo",
        descricao: "Consulta o elemento do topo sem removê-lo.",
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
  },
  {
    id: "desfazer-refazer",
    titulo: "Desfazer / Refazer",
    capitulo: "Cap. 4.3",
    codigos: [
      {
        arquivo: "src/hooks/useHistorico.ts",
        trecho: extrairArquivo(historicoFonte),
      },
      {
        arquivo: "src/App.tsx",
        trecho: extrairBloco(appFonte, "function aoTeclar("),
      },
    ],
    imagens: [
      {
        src: imgHistorico,
        alt: "Tabela com o texto e o conteúdo das pilhas desfazer e refazer a cada ação",
      },
      {
        src: imgHistorico1,
        alt: "Editor com o botão Desfazer habilitado e o Refazer desabilitado",
      },
      {
        src: imgHistorico2,
        alt: "Editor depois de desfazer, com Desfazer e Refazer habilitados",
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
  },
  {
    id: "boyer-moore",
    titulo: "Busca em cadeias: Boyer-Moore",
    capitulo: "Cap. 3.2",
    codigos: [
      {
        arquivo: "src/utils/busca.ts",
        trecho: extrairBloco(buscaFonte, "export function buscarBoyerMoore"),
      },
    ],
    imagens: [
      {
        src: imgBoyerMoore,
        alt: "Passo a passo do Boyer-Moore procurando 'pato' em 'o sapo viu o pato'",
      },
      {
        src: imgBusca,
        alt: "Editor com as três ocorrências de 'gato' destacadas e a segunda selecionada",
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
  },
  {
    id: "substituicao",
    titulo: "Substituir uma / todas",
    capitulo: "Cap. 3.2",
    codigos: [
      {
        arquivo: "src/utils/busca.ts",
        trecho: extrairBloco(buscaFonte, "export function substituirOcorrencia"),
      },
      {
        arquivo: "src/utils/busca.ts",
        trecho: extrairBloco(buscaFonte, "export function substituirTodas"),
      },
      {
        arquivo: "src/App.tsx",
        trecho: extrairBloco(appFonte, "function aoSubstituirUma"),
      },
      {
        arquivo: "src/App.tsx",
        trecho: extrairBloco(appFonte, "function aoSubstituirTodas"),
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
  },
  {
    id: "jspdf",
    titulo: "Exportação PDF com jsPDF",
    capitulo: "Biblioteca",
    explicacao:
      "A biblioteca **jsPDF** gera PDFs no lado do cliente (browser). O texto é dividido em linhas que cabem na largura útil da página (A4 menos margens). Quando a linha seguinte ultrapassa a margem inferior, uma **nova página** é criada automaticamente. O espaçamento entre linhas (leading) é fixo em 7 unidades para legibilidade.",
    passos: [
      {
        src: imgSubstituicao,
        alt: "Texto com as posições encontradas e o resultado de substituir uma ou todas",
      },
      {
        src: imgSubstituirUma,
        alt: "Editor depois de substituir apenas a segunda ocorrência",
      },
      {
        src: imgSubstituirTodas,
        alt: "Editor depois de substituir todas as ocorrências",
      },
    ],
  },
  {
    id: "jspdf",
    titulo: "jsPDF",
    capitulo: "Biblioteca",
    codigos: [
      {
        arquivo: "src/utils/exportarPdf.ts",
        trecho: extrairArquivo(exportarPdfFonte),
      },
    ],
    imagens: [
      {
        titulo: "Salvar",
        descricao: "doc.save('documento.pdf') — dispara download no navegador.",
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
  },
];

function irPara(id: string) {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
}

export default function Apresentacao() {
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

      {conceitos.map((c, i) => (
        <section className="conceito" id={c.id} key={c.id} aria-labelledby={`${c.id}-titulo`}>
          <header className="conceito-topo">
            <span className="conceito-num">{String(i + 1).padStart(2, "0")}</span>
            <h2 id={`${c.id}-titulo`}>{c.titulo}</h2>
          </header>

          {/* Explicação conceitual principal */}
          <div className="explicacao">
            <p dangerouslySetInnerHTML={{ __html: markdownNegrito(c.explicacao) }} />
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

          {/* Imagem/diagrama ilustrativo */}
          {c.imagem && (
            <div className="imagem-wrapper">
              <figure className="imagem">
                <img src={c.imagem.src} alt={c.imagem.alt} />
                <figcaption>{c.imagem.legenda}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
