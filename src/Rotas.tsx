import { useEffect, useSyncExternalStore } from "react";
import App from "./App";
import Apresentacao from "./pages/Apresentacao";

// Rotas por hash (#/apresentacao): funciona sem biblioteca extra e sem
// configuração de servidor.
function assinar(aoMudar: () => void) {
  window.addEventListener("hashchange", aoMudar);
  return () => window.removeEventListener("hashchange", aoMudar);
}

function lerHash() {
  return window.location.hash;
}

export default function Rotas() {
  const hash = useSyncExternalStore(assinar, lerHash);
  const apresentando = hash.startsWith("#/apresentacao");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [apresentando]);

  return (
    <>
      {/* O editor continua montado (só escondido) para não perder o texto
          nem o histórico de desfazer ao visitar a apresentação */}
      <div hidden={apresentando}>
        <App />
      </div>
      {apresentando && <Apresentacao />}
    </>
  );
}
