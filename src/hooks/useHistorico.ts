import { useState } from "react";
import { Pilha } from "../utils/pilha";

const LIMITE_HISTORICO = 100;

// Hook Desfazer/Refazer — Duas Pilhas Sincronizadas
// ------------------------------------------------------------
// Conceito central: DUAS PILHAS (FILO) trabalhando juntas
//
//   ┌─────────────────┐     Nova ação      ┌─────────────────┐
//   │   DESFAZER      │ ◄─────────────────  │     REFazer     │
//   │   (passado)     │                     │   (futuro)      │
//   │                 │                     │                 │
//   │  [estado 3]     │                     │                 │
//   │  [estado 2]     │                     │                 │
//   │  [estado 1]     │                     │                 │
//   └─────────────────┘                     └─────────────────┘
//        │                                        ▲
//        │ Desfazer (pop)                         │ Refazer (pop)
//        ▼                                        │
//   ┌─────────────┐                              │
//   │  TEXTO ATUAL │                              │
//   └─────────────┘                              │
//        │                                        │
//        │ Nova digitação após desfazer           │
//        └──────────────► LIMPA refazer ◄─────────┘
//
// Regras:
// - Digitar: empilha estado ATUAL em 'desfazer', LIMPA 'refazer'
// - Desfazer (Ctrl+Z): pop 'desfazer' → texto atual; push estado anterior em 'refazer'
// - Refazer (Ctrl+Y): pop 'refazer' → texto atual; push estado anterior em 'desfazer'
// - Nova digitação após desfazer: 'refazer' é limpa (futuro alternativo descartado)

export function useHistorico(inicial = "") {
  const [texto, setTexto] = useState(inicial);
  const [desfazer, setDesfazer] = useState(() => Pilha.vazia<string>(LIMITE_HISTORICO));
  const [refazer, setRefazer] = useState(() => Pilha.vazia<string>(LIMITE_HISTORICO));

  // ALTERAR: nova ação do usuário (digitação, colar, substituir)
  // - Se texto não mudou, não faz nada (evita lixo no histórico)
  // - Empilha estado ATUAL em 'desfazer' (vira passado)
  // - LIMPA 'refazer' (futuro antigo não existe mais)
  function alterar(novoTexto: string) {
    if (novoTexto === texto) return;
    setDesfazer(desfazer.empilhar(texto));
    setRefazer(refazer.limpar());
    setTexto(novoTexto);
  }

  // DESFAZER (Ctrl+Z): volta ao estado anterior
  // - Pop 'desfazer' → item = estado anterior
  // - Push estado ATUAL em 'refazer' (vira futuro disponível)
  // - Atualiza texto com o estado recuperado
  function desfazerAcao() {
    const { pilha, item } = desfazer.desempilhar();
    if (item === undefined) return; // nada para desfazer
    setDesfazer(pilha);
    setRefazer(refazer.empilhar(texto));
    setTexto(item);
  }

  // REFAZER (Ctrl+Y): re-aplica ação desfeita
  // - Pop 'refazer' → item = estado que foi desfeito
  // - Push estado ATUAL em 'desfazer' (vira passado)
  // - Atualiza texto com o estado recuperado
  function refazerAcao() {
    const { pilha, item } = refazer.desempilhar();
    if (item === undefined) return; // nada para refazer
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