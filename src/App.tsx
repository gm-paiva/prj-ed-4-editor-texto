import { useMemo, useRef, useState } from "react";
import { useHistorico } from "./hooks/useHistorico";
import { buscarBoyerMoore, substituirTodas, substituirUma } from "./utils/busca";
import { exportarPdf } from "./utils/exportarPdf";
import "./App.css";

export default function App() {
  const {
    texto, alterar, desfazerAcao, refazerAcao, podeDesfazer, podeRefazer,
  } = useHistorico("");
  const [buscar, setBuscar] = useState("");
  const [trocar, setTrocar] = useState("");
  const [caixa, setCaixa] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const total = useMemo(
    () => buscarBoyerMoore(texto, buscar, caixa).length,
    [texto, buscar, caixa]
  );

  function aoSubstituirUma() {
    const inicio = areaRef.current?.selectionStart ?? 0;
    const r = substituirUma(texto, buscar, trocar, inicio, caixa);
    if (!r.substituido) return;
    alterar(r.texto);
    // Depois do render, devolve o foco e avança o cursor
    requestAnimationFrame(() => {
      areaRef.current?.focus();
      areaRef.current?.setSelectionRange(r.cursor, r.cursor);
    });
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

  const plural = total > 1 ? "s" : "";

  return (
    <div className="app">
      <header className="topo">
        <h1>Editor de Texto</h1>
        <div className="acoes">
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
          onChange={(e) => setBuscar(e.target.value)}
        />
        <input
          aria-label="Substituir por"
          placeholder="Substituir por"
          value={trocar}
          onChange={(e) => setTrocar(e.target.value)}
        />
        <button onClick={aoSubstituirUma} disabled={total === 0}>
          Substituir uma
        </button>
        <button
          onClick={() => alterar(substituirTodas(texto, buscar, trocar, caixa))}
          disabled={total === 0}
        >
          Substituir todas
        </button>
        <label className="opcao">
          <input
            type="checkbox"
            checked={caixa}
            onChange={(e) => setCaixa(e.target.checked)}
          />
          Diferenciar maiúsculas
        </label>
        {buscar && (
          <p className="info" role="status">
            {total === 0
              ? "Nenhuma ocorrência encontrada"
              : `${total} ocorrência${plural} encontrada${plural}`}
          </p>
        )}
      </section>

      <textarea
        ref={areaRef}
        aria-label="Área de edição"
        value={texto}
        onChange={(e) => alterar(e.target.value)}
        onKeyDown={aoTeclar}
        placeholder="Comece a escrever..."
      />
    </div>
  );
}