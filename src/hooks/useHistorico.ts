import { useState } from "react";

export function useHistorico(inicial = "") {
  const [texto, setTexto] = useState(inicial);
  const [desfazer, setDesfazer] = useState<string[]>([]); // pilha 1
  const [refazer, setRefazer] = useState<string[]>([]);   // pilha 2

  // Toda ação nova: empilha o estado atual em "desfazer" e esvazia "refazer"
  function alterar(novoTexto: string) {
    if (novoTexto === texto) return;
    setDesfazer([...desfazer, texto]);
    setRefazer([]);
    setTexto(novoTexto);
  }

  // Desfazer: tira o topo de "desfazer" e manda o texto atual para "refazer"
  function desfazerAcao() {
    if (desfazer.length === 0) return;
    const topo = desfazer[desfazer.length - 1];
    setDesfazer(desfazer.slice(0, -1));
    setRefazer([...refazer, texto]);
    setTexto(topo);
  }

  function refazerAcao() {
    if (refazer.length === 0) return;
    const topo = refazer[refazer.length - 1];
    setRefazer(refazer.slice(0, -1));
    setDesfazer([...desfazer, texto]);
    setTexto(topo);
  }

  return {
    texto,
    alterar,
    desfazerAcao,
    refazerAcao,
    podeDesfazer: desfazer.length > 0,
    podeRefazer: refazer.length > 0,
  };
}