import { useRef, useState } from "react";
import { useHistorico } from "./hooks/useHistorico";
import { substituirTodas, substituirUma } from "./utils/busca";
import { exportarPdf } from "./utils/exportarPdf";
import "./App.css";

export default function App() {
  const {
    texto, alterar, desfazerAcao, refazerAcao, podeDesfazer, podeRefazer,
  } = useHistorico("");
  const [buscar, setBuscar] = useState("");
  const [trocar, setTrocar] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const cursor = () => areaRef.current?.selectionStart ?? 0;

  return (
    <div className="app">
      <header className="topo">
        <h1>Editor de Texto</h1>
        <div className="acoes">
          <button onClick={desfazerAcao} disabled={!podeDesfazer}>↶ Desfazer</button>
          <button onClick={refazerAcao} disabled={!podeRefazer}>↷ Refazer</button>
          <button className="primario" onClick={() => exportarPdf(texto)}>
            Exportar PDF
          </button>
        </div>
      </header>

      <section className="busca">
        <input
          placeholder="Palavra a buscar"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <input
          placeholder="Substituir por"
          value={trocar}
          onChange={(e) => setTrocar(e.target.value)}
        />
        <button onClick={() => alterar(substituirUma(texto, buscar, trocar, cursor()))}>
          Substituir uma
        </button>
        <button onClick={() => alterar(substituirTodas(texto, buscar, trocar))}>
          Substituir todas
        </button>
      </section>

      <textarea
        ref={areaRef}
        value={texto}
        onChange={(e) => alterar(e.target.value)}
        placeholder="Comece a escrever..."
      />
    </div>
  );
}