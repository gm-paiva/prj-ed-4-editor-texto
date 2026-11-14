import { useMemo, useRef, useState, type ReactNode } from "react";
import { useHistorico } from "./hooks/useHistorico";
import {
  buscaBoyerMoore,
  substituirOcorrencia,
  substituirTodas,
} from "./utils/busca";
import { exportarPdf } from "./utils/exportarPdf";
import "./App.css";

// Monta o texto da camada de fundo, envolvendo cada ocorrência em <mark>.
// A ocorrência selecionada (a que "Substituir uma" vai trocar) ganha "ativa".
function montarEspelho(
  texto: string,
  posicoes: number[],
  tamanho: number,
  ativa: number
): ReactNode[] {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  posicoes.forEach((posicao, i) => {
    partes.push(texto.slice(ultimo, posicao));
    partes.push(
      <mark key={posicao} className={i === ativa ? "marca ativa" : "marca"}>
        {texto.slice(posicao, posicao + tamanho)}
      </mark>
    );
    ultimo = posicao + tamanho;
  });
  partes.push(texto.slice(ultimo));
  return partes;
}

export default function App() {
  const {
    texto, alterar, desfazerAcao, refazerAcao, podeDesfazer, podeRefazer,
  } = useHistorico("");
  const [buscar, setBuscar] = useState("");
  const [trocar, setTrocar] = useState("");
  // Índice da ocorrência selecionada dentro da lista de posições
  const [atual, setAtual] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const espelhoRef = useRef<HTMLDivElement>(null);

  const posicoes = useMemo(
    () => buscaBoyerMoore(texto, buscar),
    [texto, buscar]
  );
  const total = posicoes.length;
  // Se o texto mudou e a lista encolheu, volta para o começo em vez de quebrar
  const ativa = total === 0 ? -1 : atual % total;

  function aoMudarBusca(valor: string) {
    setBuscar(valor);
    setAtual(0);
  }

  // Rola a área de edição até a ocorrência selecionada ficar visível
  function mostrarAtiva() {
    requestAnimationFrame(() => {
      const area = areaRef.current;
      const marca = espelhoRef.current?.querySelector<HTMLElement>(".marca.ativa");
      if (!area || !marca) return;
      const topo = marca.offsetTop;
      const base = topo + marca.offsetHeight;
      if (topo < area.scrollTop || base > area.scrollTop + area.clientHeight) {
        area.scrollTop = topo - area.clientHeight / 2;
      }
    });
  }

  // Navegação circular: depois da última volta para a primeira, e vice-versa
  function irPara(indice: number) {
    if (total === 0) return;
    setAtual((indice + total) % total);
    mostrarAtiva();
  }

  function aoSubstituirUma() {
    if (ativa < 0) return;
    const inicio = posicoes[ativa];
    const novoTexto = substituirOcorrencia(texto, inicio, buscar.length, trocar);
    // A seleção avança para a primeira ocorrência depois do trecho trocado
    const fim = inicio + trocar.length;
    const proxima = buscaBoyerMoore(novoTexto, buscar).findIndex(
      (p) => p >= fim
    );
    alterar(novoTexto);
    setAtual(proxima === -1 ? 0 : proxima);
    mostrarAtiva();
  }

  function aoSubstituirTodas() {
    alterar(substituirTodas(texto, buscar, trocar));
    setAtual(0);
  }

  // Enter no campo de busca vai para a próxima; Shift+Enter, para a anterior
  function aoTeclarBusca(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    irPara(e.shiftKey ? ativa - 1 : ativa + 1);
  }

  // Impede o Ctrl+Z nativo do navegador de bagunçar as nossas duas pilhas
  function aoTeclar(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const tecla = e.key.toLowerCase();
    if (tecla === "z" && !e.shiftKey) {
      e.preventDefault();
      desfazerAcao();
    } else if (tecla === "y" || (tecla === "z" && e.shiftKey)) {
      e.preventDefault();
      refazerAcao();
    }
  }

  // Mantém a camada de destaque rolando junto com o textarea
  function aoRolar(e: React.UIEvent<HTMLTextAreaElement>) {
    if (espelhoRef.current) {
      espelhoRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }

  const plural = total > 1 ? "s" : "";

  return (
    <div className="app">
      <header className="topo">
        <h1>Editor de Texto</h1>
        <div className="acoes">
          <a className="botao" href="#/apresentacao">Apresentação</a>
          <button onClick={desfazerAcao} disabled={!podeDesfazer}>↶ Desfazer</button>
          <button onClick={refazerAcao} disabled={!podeRefazer}>↷ Refazer</button>
          <button
            className="primario"
            onClick={() => exportarPdf(texto)}
            disabled={!texto}
          >
            Exportar PDF
          </button>
        </div>
      </header>

      <section className="busca">
        <input
          aria-label="Palavra a buscar"
          placeholder="Palavra a buscar"
          value={buscar}
          onChange={(e) => aoMudarBusca(e.target.value)}
          onKeyDown={aoTeclarBusca}
        />
        <input
          aria-label="Substituir por"
          placeholder="Substituir por"
          value={trocar}
          onChange={(e) => setTrocar(e.target.value)}
        />
        <button onClick={() => irPara(ativa - 1)} disabled={total < 2}>
          ← Anterior
        </button>
        <button onClick={() => irPara(ativa + 1)} disabled={total < 2}>
          Próxima →
        </button>
        <button onClick={aoSubstituirUma} disabled={total === 0}>
          Substituir uma
        </button>
        <button onClick={aoSubstituirTodas} disabled={total === 0}>
          Substituir todas
        </button>
        {buscar && (
          <p className="info" role="status">
            {total === 0
              ? "Nenhuma ocorrência encontrada"
              : `${ativa + 1} de ${total} ocorrência${plural}`}
          </p>
        )}
      </section>

      <div className="editor">
        <div ref={espelhoRef} className="espelho" aria-hidden="true">
          {montarEspelho(texto, posicoes, buscar.length, ativa)}
          {"\n"}
        </div>
        <textarea
          ref={areaRef}
          aria-label="Área de edição"
          value={texto}
          onChange={(e) => alterar(e.target.value)}
          onKeyDown={aoTeclar}
          onScroll={aoRolar}
          placeholder="Comece a escrever..."
        />
      </div>
    </div>
  );
}
