import { useState } from "react";
import { Pilha } from "../utils/pilha";

const LIMITE_HISTORICO = 100;

export function useHistorico(inicial = "") {
  const [texto, setTexto] = useState(inicial);
  const [desfazer, setDesfazer] = useState(() => Pilha.vazia<string>(LIMITE_HISTORICO));
  const [refazer, setRefazer] = useState(() => Pilha.vazia<string>(LIMITE_HISTORICO));

  // Ação nova: empilha o estado atual em "desfazer" e esvazia "refazer"
  function alterar(novoTexto: string) {
    if (novoTexto === texto) return;
    setDesfazer(desfazer.empilhar(texto));
    setRefazer(refazer.limpar());
    setTexto(novoTexto);
  }

  // Desfazer: tira o topo de "desfazer" e manda o texto atual para "refazer"
  function desfazerAcao() {
    const { pilha, item } = desfazer.desempilhar();
    if (item === undefined) return;
    setDesfazer(pilha);
    setRefazer(refazer.empilhar(texto));
    setTexto(item);
  }

  function refazerAcao() {
    const { pilha, item } = refazer.desempilhar();
    if (item === undefined) return;
    setRefazer(pilha);
    setDesfazer(desfazer.empilhar(texto));
    setTexto(item);
  }

  return {
    texto,
    alterar,
    desfazerAcao,
    refazerAcao,
    podeDesfazer: !desfazer.estaVazia(),
    podeRefazer: !refazer.estaVazia(),
  };
}