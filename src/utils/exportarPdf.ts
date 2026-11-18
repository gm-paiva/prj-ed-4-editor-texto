import { jsPDF } from "jspdf";

// Exportação PDF com jsPDF (client-side, no browser)
// ------------------------------------------------------------
// Conceito: Gera arquivo PDF diretamente no navegador sem servidor.
// Fluxo:
// 1. Cria documento jsPDF (A4 retrato por padrão)
// 2. Calcula largura útil = largura da página - 2×margem
// 3. splitTextToSize() quebra o texto em linhas que cabem na largura
// 4. Desenha linha a linha, controlando posição Y
// 5. Se Y ultrapassa margem inferior → addPage() e reinicia Y
// 6. save() dispara download no navegador

export function exportarPdf(texto: string, nomeArquivo = "documento") {
  const doc = new jsPDF();                    // Novo documento A4 (210×297mm)
  const margem = 15;                          // Margem de 15mm em todos os lados
  const larguraUtil = doc.internal.pageSize.getWidth() - margem * 2; // ~180mm
  const alturaPagina = doc.internal.pageSize.getHeight();            // 297mm

  doc.setFontSize(12);                        // Fonte base 12pt

  // Quebra texto em linhas respeitando largura útil
  // splitTextToSize NÃO corta palavras ao meio — quebra no espaço
  const linhas: string[] = doc.splitTextToSize(texto, larguraUtil);

  let y = margem;                             // Posição vertical inicial (topo)
  for (const linha of linhas) {
    // VERIFICA QUEBRA DE PÁGINA:
    // Se próxima linha passa da margem inferior, cria nova página
    if (y > alturaPagina - margem) {
      doc.addPage();                          // Nova página A4
      y = margem;                             // Reinicia Y no topo
    }
    doc.text(linha, margem, y);               // Desenha linha em (margem, y)
    y += 7;                                   // Leading (espaçamento entre linhas) = 7 unidades
  }
  doc.save(`${nomeArquivo}.pdf`);             // Dispara download
}