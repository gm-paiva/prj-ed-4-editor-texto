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

interface Codigo {
  arquivo: string;
  trecho: Trecho;
}

interface Imagem {
  src: string;
  alt: string;
}

interface Conceito {
  id: string;
  titulo: string;
  capitulo: string;
  codigos: Codigo[];
  imagens: Imagem[];
}

const conceitos: Conceito[] = [
  {
    id: "pilha",
    titulo: "Pilha (FILO)",
    capitulo: "Cap. 4.3",
    codigos: [
      {
        arquivo: "src/utils/pilha.ts",
        trecho: extrairBloco(pilhaFonte, "export class Pilha"),
      },
    ],
    imagens: [
      {
        src: imgPilha,
        alt: "Pilha recebendo os itens A, B e C e depois removendo o C do topo",
      },
    ],
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
    imagens: [
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
        src: imgPdf,
        alt: "Duas páginas A4 com a margem, a largura útil, o espaço de 7 entre linhas e a quebra para uma nova página",
      },
    ],
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
            <span className="conceito-cap">{c.capitulo}</span>
          </header>

          <div className="codigos">
            {c.codigos.map((cod) => (
              <BlocoCodigo
                key={cod.arquivo + cod.trecho.inicio}
                arquivo={cod.arquivo}
                trecho={cod.trecho}
                mostrarComentarios={MOSTRAR_COMENTARIOS}
              />
            ))}
          </div>

          <div className="imagens">
            {c.imagens.map((img) => (
              <figure className="imagem" key={img.src}>
                <img src={img.src} alt={img.alt} />
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
