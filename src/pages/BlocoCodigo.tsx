import { prepararLinhas, type Trecho } from "../utils/codigo";

interface Props {
  arquivo: string;
  trecho: Trecho;
  mostrarComentarios?: boolean;
}

export default function BlocoCodigo({
  arquivo,
  trecho,
  mostrarComentarios = false,
}: Props) {
  const linhas = prepararLinhas(trecho, mostrarComentarios);
  if (linhas.length === 0) return null;

  const primeira = linhas[0].numero;
  const ultima = linhas[linhas.length - 1].numero;

  return (
    <figure className="codigo">
      <figcaption className="codigo-topo">
        <span>{arquivo}</span>
        <span>
          linhas {primeira}–{ultima}
        </span>
      </figcaption>
      <pre>
        <code>
          {linhas.map((linha) => (
            <span className="linha" key={linha.numero}>
              <span className="linha-n" aria-hidden="true">
                {linha.numero}
              </span>
              <span className="linha-c">
                {linha.tokens.map((t, i) => (
                  <span
                    key={i}
                    className={t.tipo === "simples" ? undefined : `tk-${t.tipo}`}
                  >
                    {t.valor}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
