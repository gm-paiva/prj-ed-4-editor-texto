# Editor de Texto

Editor de texto web desenvolvido em React (Vite) e TypeScript. Projeto acadêmico da FATEC (PRJ.ED.4).

## Funcionalidades

- Desfazer e refazer ações, com duas pilhas (FILO) e atalhos Ctrl+Z / Ctrl+Y
- Busca com Boyer-Moore (heurística do caractere ruim)
- Todas as ocorrências ficam destacadas; a selecionada aparece em laranja
- Botões Anterior e Próxima (ou Enter / Shift+Enter no campo de busca) para
  escolher qual ocorrência será substituída
- Substituir a ocorrência selecionada ou todas de uma vez
- Opção de diferenciar maiúsculas e minúsculas
- Exportar o texto como PDF
- Página de apresentação do projeto (botão "Apresentação" ou `#/apresentacao`),
  com uma seção para cada conceito estudado: código real e imagens de exemplo

## Como rodar

    npm install
    npm run dev

## Estrutura

    src/utils/pilha.ts          Pilha genérica (FILO)
    src/hooks/useHistorico.ts   Desfazer/refazer com duas pilhas
    src/utils/busca.ts          Boyer-Moore e substituição
    src/utils/exportarPdf.ts    Exportação para PDF (jsPDF)
    src/Rotas.tsx               Alterna entre o editor e a apresentação (hash)
    src/pages/Apresentacao.tsx  Página de apresentação (seções por conceito)
    src/pages/BlocoCodigo.tsx   Bloco de código com numeração de linhas
    src/utils/codigo.ts         Recorta e colore trechos do código-fonte
    src/assets/apresentacao/    Imagens de exemplo da apresentação

## Tecnologias

- TypeScript
- React (Vite)
- jsPDF