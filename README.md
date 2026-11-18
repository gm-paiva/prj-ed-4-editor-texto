# Editor de Texto — PRJ.ED.4

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/jsPDF-4.2-C62828?logo=adobeacrobatreader&logoColor=white" alt="jsPDF" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Academic-FATEC-blue" alt="FATEC" />
</p>

<p align="center">
  <strong>Editor de texto web</strong> desenvolvido com React, TypeScript e Vite.<br />
  Implementa <em>desfazer/refazer</em> com duas pilhas, busca <strong>Boyer-Moore</strong> (heurística do caractere ruim),<br />
  substituição de ocorrências (uma ou todas) e exportação para <strong>PDF</strong>. Tudo <em>client-side</em>.
</p>

---

## 🎯 Visão Geral

Este projeto é a entrega da disciplina **PRJ.ED.4** (Estruturas de Dados) da **FATEC**. O objetivo é demonstrar, na prática, a aplicação de estruturas de dados clássicas e algoritmos de busca em uma aplicação real: um editor de texto funcional no navegador.

| Característica | Detalhe |
|----------------|---------|
| **Tipo** | Single Page Application (SPA) |
| **Roteamento** | Hash-based — sem servidor, sem configuração extra |
| **Estado** | Imutável, gerenciado via hooks React + estruturas imutáveis próprias |
| **Build** | Vite + TypeScript (`tsc -b && vite build`) |
| **Deploy** | Arquivos estáticos — funciona em GitHub Pages, Netlify, Vercel, etc. |

---

## 🛠 Stack Tecnológica

| Categoria | Tecnologia | Versão | Papel |
|-----------|------------|--------|-------|
| **Core** | React | 19.3 | UI declarativa, hooks, `useSyncExternalStore` para hash routing |
| **Linguagem** | TypeScript | 6.0 | Tipagem estrita, imutabilidade, DX |
| **Build** | Vite | 8.3 | Dev server rápido, build otimizado, HMR |
| **PDF** | jsPDF | 4.2 | Geração de PDF no navegador |
| **Lint** | ESLint | 10.14 | Qualidade de código, `eslint-plugin-react-hooks` |
| **Formatação** | TypeScript ESLint | 8.72 | Regras TypeScript-aware |

---

## 🚀 Início Rápido

### Pré-requisitos
- **Node.js** ≥ 18 (recomendado 20+)
- **npm** ≥ 9 (ou pnpm/yarn)

### Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/gm-paiva/prj-ed-4-editor-texto.git
cd prj-ed-4-editor-texto

# 2. Instale dependências
npm install

# 3. Rode em desenvolvimento (HMR ativo)
npm run dev
# → abre em http://localhost:5173 (ou porta indicada)

# 4. Build de produção
npm run build
# → saída em ./dist (pronto para deploy estático)

# 5. Preview do build de produção
npm run preview
```

### Estrutura de comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento Vite com HMR |
| `npm run build` | Compila TypeScript (`tsc -b`) + build Vite para `./dist` |
| `npm run preview` | Serve `./dist` localmente para validar build |
| `npm run lint` | Executa ESLint em todo o projeto |

---

## 📁 Estrutura do Projeto

```
prj-ed-4-editor-texto/
├── public/                 # Assets estáticos servidos como estão
├── src/
│   ├── App.tsx            # Componente principal: editor + barra + busca + substituição
│   ├── App.css            # Estilos do editor (CSS Modules-like, escopo global controlado)
│   ├── Rotas.tsx          # Roteamento por hash (#/ e #/apresentacao)
│   ├── main.tsx           # Bootstrap React 19 (createRoot)
│   ├── hooks/
│   │   └── useHistorico.ts   # Hook Desfazer/Refazer — DUAS PILHAS sincronizadas
│   ├── pages/
│   │   ├── Apresentacao.tsx  # Página acadêmica com 5 conceitos + código + diagramas
│   │   ├── Apresentacao.css  # Estilos da apresentação (layout, hero, cards, código)
│   │   └── BlocoCodigo.tsx   # Bloco de código com numeração de linhas + highlight
│   ├── utils/
│   │   ├── pilha.ts          # Pilha genérica imutável (FILO) — base do histórico
│   │   ├── busca.ts          # Boyer-Moore + substituirOcorrencia + substituirTodas
│   │   ├── exportarPdf.ts    # Geração PDF via jsPDF (quebra de linha/página)
│   │   └── codigo.ts         # Utilitário: extrai trechos de arquivos .ts brutos
│   └── assets/apresentacao/  # Diagramas SVG + 1 PNG (enunciado)
│       ├── pilha.svg
│       ├── boyer-moore.svg
│       ├── substituicao.svg
│       ├── historico.svg
│       ├── pdf.svg
│       └── enunciado.png
├── index.html               # HTML base (Vite injeta scripts)
├── package.json
├── tsconfig.json            # Config TypeScript (project references)
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts           # Config Vite (plugin React)
├── eslint.config.js         # Config ESLint flat
└── README.md                # Este arquivo
```

---

## 🎓 Apresentação Acadêmica

Acesse `#/apresentacao` para ver a página didática do projeto.

### O que você encontra lá:
| Seção | Conceito | Arquivo-fonte | Diagrama |
|-------|----------|---------------|----------|
| 01 | Pilha (FILO) | `src/utils/pilha.ts` | `pilha.svg` |
| 02 | Desfazer/Refazer (2 Pilhas) | `src/hooks/useHistorico.ts` | `historico.svg` |
| 03 | Boyer-Moore (Caractere Ruim) | `src/utils/busca.ts` | `boyer-moore.svg` |
| 04 | Substituir Uma / Todas | `src/utils/busca.ts` | `substituicao.svg` |
| 05 | Exportação PDF (jsPDF) | `src/utils/exportarPdf.ts` | `pdf.svg` |

---

## 📄 Licença

Este projeto está sob a licença **MIT** — veja o arquivo [LICENSE](LICENSE) para detalhes.

> **Uso acadêmico**: Desenvolvido para a disciplina **PRJ.ED.4 (Estruturas de Dados)** da **FATEC**.  
> Sinta-se livre para estudar, adaptar e usar como base para seus próprios projetos.

---

## 👨‍💻 Autores

- [**Guilherme Matos Paiva**](https://github.com/gm-paiva)
- [**Mariana Pereira Tavares**](https://github.com/Mari432hz)
