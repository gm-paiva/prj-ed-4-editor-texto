# Editor de Texto

Editor de texto web desenvolvido em React (Vite) e TypeScript. Projeto acadêmico da FATEC (PRJ.ED.4).

## Funcionalidades

- Desfazer e refazer ações, com duas pilhas (FILO) e atalhos Ctrl+Z / Ctrl+Y
- Substituir uma ou todas as ocorrências de uma palavra
- Busca com Boyer-Moore (heurística do caractere ruim) e com busca trivial
- Opção de diferenciar maiúsculas e minúsculas
- Exportar o texto como PDF

## Como rodar

    npm install
    npm run dev

## Estrutura

    src/utils/pilha.ts        Pilha genérica (FILO)
    src/hooks/useHistorico.ts Desfazer/refazer com duas pilhas
    src/utils/busca.ts        Busca trivial, Boyer-Moore e substituição
    src/utils/exportarPdf.ts  Exportação para PDF (jsPDF)

## Tecnologias

- TypeScript
- React (Vite)
- jsPDF