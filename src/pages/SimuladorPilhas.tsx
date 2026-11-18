import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { Pilha } from "../utils/pilha";

// Simulador interativo das duas pilhas (Desfazer / Refazer)
// ------------------------------------------------------------
// Usa a MESMA classe Pilha do editor. A lógica de alterar / desfazerAcao /
// refazerAcao abaixo espelha a de src/hooks/useHistorico.ts; a diferença é que
// cada estado ganha um `id`, para o item poder "viajar" entre as pilhas na tela.

// Limite didático (cabem 6 itens na tela). No editor o limite é 100.
const LIMITE = 6;

interface Estado {
  id: number;
  texto: string;
}

type Tipo = "inicio" | "alterar" | "desfazer" | "refazer";

interface Registro {
  tipo: Tipo;
  chamada: string;
  texto: string;
}

interface Modelo {
  atual: Estado;
  desfazer: Pilha<Estado>;
  refazer: Pilha<Estado>;
  proximoId: number;
  tipo: Tipo;
  chamada: string;
  passos: string[];
  registros: Registro[];
}

type Acao =
  | { tipo: "alterar"; texto: string }
  | { tipo: "desfazer" }
  | { tipo: "refazer" }
  | { tipo: "reiniciar" };

/** Mesmo exemplo da tabela antiga: a → ab → abc, desfazer ×2, refazer, abx */
const ROTEIRO: Acao[] = [
  { tipo: "alterar", texto: "a" },
  { tipo: "alterar", texto: "ab" },
  { tipo: "alterar", texto: "abc" },
  { tipo: "desfazer" },
  { tipo: "desfazer" },
  { tipo: "refazer" },
  { tipo: "alterar", texto: "abx" },
];

const q = (texto: string) => JSON.stringify(texto);

function inicial(): Modelo {
  return {
    atual: { id: 0, texto: "" },
    desfazer: Pilha.vazia<Estado>(LIMITE),
    refazer: Pilha.vazia<Estado>(LIMITE),
    proximoId: 1,
    tipo: "inicio",
    chamada: "início",
    passos: ['as duas pilhas começam vazias — texto atual = ""'],
    registros: [{ tipo: "inicio", chamada: "início", texto: "" }],
  };
}

/** Lista os itens (base → topo) sem alterar a pilha: ela é imutável. */
function listar(pilha: Pilha<Estado>): Estado[] {
  const itens: Estado[] = [];
  let resto = pilha;
  for (;;) {
    const { pilha: proxima, item } = resto.desempilhar();
    if (item === undefined) break;
    itens.push(item);
    resto = proxima;
  }
  return itens.reverse();
}

function reducer(m: Modelo, a: Acao): Modelo {
  switch (a.tipo) {
    case "reiniciar":
      return inicial();

    case "alterar": {
      const chamada = `alterar(${q(a.texto)})`;
      if (a.texto === m.atual.texto) {
        return {
          ...m,
          tipo: "alterar",
          chamada,
          passos: [
            `o texto já é ${q(a.texto)} — nada é empilhado (evita lixo no histórico)`,
          ],
        };
      }
      const cheia = m.desfazer.tamanho() >= LIMITE;
      const descartados = m.refazer.tamanho();
      const novo: Estado = { id: m.proximoId, texto: a.texto };
      const passos = [
        `desfazer.empilhar(${q(m.atual.texto)}) — o texto atual vira passado`,
        ...(cheia
          ? [`limite de ${LIMITE} atingido — o item mais antigo (base) foi descartado`]
          : []),
        descartados === 0
          ? "refazer.limpar() — já estava vazia"
          : `refazer.limpar() — ${descartados} ${descartados === 1 ? "item do futuro descartado" : "itens do futuro descartados"}`,
        `texto atual = ${q(a.texto)}`,
      ];
      return {
        ...m,
        atual: novo,
        desfazer: m.desfazer.empilhar(m.atual),
        refazer: m.refazer.limpar(),
        proximoId: m.proximoId + 1,
        tipo: "alterar",
        chamada,
        passos,
        registros: [...m.registros, { tipo: "alterar", chamada, texto: a.texto }],
      };
    }

    case "desfazer": {
      const chamada = "desfazerAcao()";
      const { pilha, item } = m.desfazer.desempilhar();
      if (item === undefined) {
        return {
          ...m,
          tipo: "desfazer",
          chamada,
          passos: ["desfazer está vazia — não há nada para desfazer"],
        };
      }
      return {
        ...m,
        atual: item,
        desfazer: pilha,
        refazer: m.refazer.empilhar(m.atual),
        tipo: "desfazer",
        chamada,
        passos: [
          `desfazer.desempilhar() — sai o topo ${q(item.texto)}`,
          `refazer.empilhar(${q(m.atual.texto)}) — o texto atual vira futuro`,
          `texto atual = ${q(item.texto)}`,
        ],
        registros: [...m.registros, { tipo: "desfazer", chamada, texto: item.texto }],
      };
    }

    case "refazer": {
      const chamada = "refazerAcao()";
      const { pilha, item } = m.refazer.desempilhar();
      if (item === undefined) {
        return {
          ...m,
          tipo: "refazer",
          chamada,
          passos: ["refazer está vazia — não há nada para refazer"],
        };
      }
      return {
        ...m,
        atual: item,
        refazer: pilha,
        desfazer: m.desfazer.empilhar(m.atual),
        tipo: "refazer",
        chamada,
        passos: [
          `refazer.desempilhar() — sai o topo ${q(item.texto)}`,
          `desfazer.empilhar(${q(m.atual.texto)}) — o texto atual vira passado`,
          `texto atual = ${q(item.texto)}`,
        ],
        registros: [...m.registros, { tipo: "refazer", chamada, texto: item.texto }],
      };
    }
  }
}

function reduzirMovimento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface ColunaProps {
  titulo: string;
  subtitulo: string;
  classe: string;
  itens: Estado[];
  saindo?: boolean;
}

function ColunaPilha({ titulo, subtitulo, classe, itens, saindo = false }: ColunaProps) {
  return (
    <section className={`sim-coluna ${classe}`} aria-label={`Pilha ${titulo}`}>
      <h3 className="sim-titulo">
        {titulo}
        <small>
          {subtitulo} · {itens.length}/{LIMITE}
        </small>
      </h3>
      <div className="sim-pilha-wrap">
        <ul className="sim-pilha">
          {itens.map((e, i) => (
            <li
              key={e.id}
              data-eid={e.id}
              className={`sim-item${i === itens.length - 1 ? " topo" : ""}${saindo ? " saindo" : ""}`}
            >
              <span className="sim-txt">{q(e.texto)}</span>
              {i === itens.length - 1 && <span className="sim-etiqueta">topo</span>}
            </li>
          ))}
        </ul>
        {itens.length === 0 && <p className="sim-vazia">vazia</p>}
      </div>
    </section>
  );
}

function Passo({ texto }: { texto: string }) {
  const [codigo, ...resto] = texto.split(" — ");
  if (resto.length === 0) return <>{texto}</>;
  return (
    <>
      <code>{codigo}</code> — {resto.join(" — ")}
    </>
  );
}

export default function SimuladorPilhas() {
  const [m, dispatch] = useReducer(reducer, undefined, inicial);
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [roteiro, setRoteiro] = useState<number | null>(null);

  const raiz = useRef<HTMLDivElement>(null);
  const posicoes = useRef<Map<number, { x: number; y: number }>>(new Map());
  const modeloRef = useRef(m);
  const timerSaida = useRef<number | undefined>(undefined);

  useEffect(() => {
    modeloRef.current = m;
  }, [m]);

  useEffect(() => () => window.clearTimeout(timerSaida.current), []);

  /** Executa uma ação. Ao alterar com futuro guardado, mostra antes o 'refazer' sendo esvaziado. */
  const executar = useCallback((acao: Acao) => {
    const confirmar = () => {
      dispatch(acao);
      setRascunho(null);
      setSaindo(false);
    };
    const atual = modeloRef.current;
    const limpaFuturo =
      acao.tipo === "alterar" &&
      acao.texto !== atual.atual.texto &&
      !atual.refazer.estaVazia();

    if (limpaFuturo && !reduzirMovimento()) {
      setSaindo(true);
      timerSaida.current = window.setTimeout(confirmar, 300);
    } else {
      confirmar();
    }
  }, []);

  // Exemplo guiado: executa o roteiro passo a passo
  useEffect(() => {
    if (roteiro === null || saindo) return;
    const t = window.setTimeout(
      () => {
        if (roteiro >= ROTEIRO.length) {
          setRoteiro(null);
          return;
        }
        executar(ROTEIRO[roteiro]);
        setRoteiro(roteiro + 1);
      },
      roteiro === 0 ? 600 : 1800,
    );
    return () => window.clearTimeout(t);
  }, [roteiro, saindo, executar]);

  // FLIP: mede onde cada item está e anima do lugar antigo até o novo
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const base = el.getBoundingClientRect();
    const novas = new Map<number, { x: number; y: number }>();
    const animar = !reduzirMovimento() && posicoes.current.size > 0;

    el.querySelectorAll<HTMLElement>("[data-eid]").forEach((no) => {
      const id = Number(no.dataset.eid);
      const r = no.getBoundingClientRect();
      const pos = { x: r.left - base.left, y: r.top - base.top };
      novas.set(id, pos);
      if (!animar) return;

      const antes = posicoes.current.get(id);
      if (antes) {
        const dx = antes.x - pos.x;
        const dy = antes.y - pos.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          no.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)`, zIndex: 20 },
              { transform: "translate(0, 0)", zIndex: 20 },
            ],
            { duration: 650, easing: "cubic-bezier(.3,.7,.2,1)" },
          );
        }
      } else {
        no.animate(
          [
            { opacity: 0, transform: "translateY(-16px) scale(.9)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 450, easing: "ease-out" },
        );
      }
    });
    posicoes.current = novas;
  }, [m]);

  const guiado = roteiro !== null;
  const bloqueado = saindo || guiado;
  const valor = rascunho ?? m.atual.texto;
  const proximaLetra = String.fromCharCode(97 + (m.atual.texto.length % 26));

  function iniciarRoteiro() {
    window.clearTimeout(timerSaida.current);
    setSaindo(false);
    setRascunho(null);
    dispatch({ tipo: "reiniciar" });
    setRoteiro(0);
  }

  function reiniciar() {
    window.clearTimeout(timerSaida.current);
    setRoteiro(null);
    setSaindo(false);
    setRascunho(null);
    dispatch({ tipo: "reiniciar" });
  }

  function aoDigitar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!(e.ctrlKey || e.metaKey) || bloqueado) return;
    const tecla = e.key.toLowerCase();
    if (tecla === "z" && !e.shiftKey) {
      e.preventDefault();
      executar({ tipo: "desfazer" });
    } else if (tecla === "y" || (tecla === "z" && e.shiftKey)) {
      e.preventDefault();
      executar({ tipo: "refazer" });
    }
  }

  const ultimos = m.registros.slice(-6).reverse();

  return (
    <figure className="simulador" ref={raiz}>
      <div className="sim-palco">
        <ColunaPilha
          titulo="desfazer"
          subtitulo="passado"
          classe="sim-col-desfazer"
          itens={listar(m.desfazer)}
        />

        <section className="sim-coluna sim-col-atual" aria-label="Texto atual">
          <h3 className="sim-titulo">
            texto atual
            <small>estado vivo</small>
          </h3>
          <div className="sim-centro">
            <div className="sim-slot">
              <div className="sim-item atual" data-eid={m.atual.id}>
                <span className="sim-txt">{q(m.atual.texto)}</span>
              </div>
            </div>
          </div>
        </section>

        <ColunaPilha
          titulo="refazer"
          subtitulo="futuro"
          classe="sim-col-refazer"
          itens={listar(m.refazer)}
          saindo={saindo}
        />
      </div>

      <form
        className="sim-controles"
        onSubmit={(e) => {
          e.preventDefault();
          if (!bloqueado) executar({ tipo: "alterar", texto: valor });
        }}
      >
        <label className="sim-campo">
          <span>texto</span>
          <input
            value={valor}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={aoDigitar}
            readOnly={bloqueado}
            spellCheck={false}
            autoComplete="off"
            aria-label="Novo texto do editor"
          />
        </label>
        <button type="submit" className="primario" disabled={bloqueado}>
          alterar
        </button>
        <button
          type="button"
          disabled={bloqueado}
          onClick={() => executar({ tipo: "alterar", texto: m.atual.texto + proximaLetra })}
          title={`Acrescenta "${proximaLetra}" ao texto atual`}
        >
          + letra
        </button>
        <button
          type="button"
          className="sim-btn-desfazer"
          disabled={bloqueado || m.desfazer.estaVazia()}
          onClick={() => executar({ tipo: "desfazer" })}
        >
          desfazerAcao()
        </button>
        <button
          type="button"
          className="sim-btn-refazer"
          disabled={bloqueado || m.refazer.estaVazia()}
          onClick={() => executar({ tipo: "refazer" })}
        >
          refazerAcao()
        </button>
        <span className="sim-espaco" />
        <button type="button" onClick={guiado ? () => setRoteiro(null) : iniciarRoteiro}>
          {guiado ? "■ Parar" : "▶ Exemplo guiado"}
        </button>
        <button type="button" onClick={reiniciar}>
          Reiniciar
        </button>
      </form>

      <div className="sim-explica" aria-live="polite">
        <code className={`sim-chamada ${m.tipo}`}>{m.chamada}</code>
        <ol>
          {m.passos.map((p, i) => (
            <li key={`${m.chamada}-${i}`}>
              <Passo texto={p} />
            </li>
          ))}
        </ol>
      </div>

      <ul className="sim-log" aria-label="Últimas ações">
        {ultimos.map((r, i) => (
          <li key={m.registros.length - i} className={r.tipo}>
            <code>{r.chamada}</code>
            <span>
              texto <code>{q(r.texto)}</code>
            </span>
          </li>
        ))}
      </ul>

      <figcaption>
        Simulador interativo com a classe <code>Pilha</code> do projeto. Digite e use{" "}
        <code>alterar</code>, <code>desfazerAcao()</code> e <code>refazerAcao()</code> (ou Ctrl+Z / Ctrl+Y
        no campo) ou rode o exemplo guiado. Limite didático de {LIMITE} itens; no editor, 100.
      </figcaption>
    </figure>
  );
}
