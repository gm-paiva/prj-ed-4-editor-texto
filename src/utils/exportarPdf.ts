import { jsPDF } from "jspdf";

export function exportarPdf(texto: string, nomeArquivo = "documento") {
  const doc = new jsPDF();
  const margem = 15;
  const larguraUtil = doc.internal.pageSize.getWidth() - margem * 2;
  const alturaPagina = doc.internal.pageSize.getHeight();

  doc.setFontSize(12);
  const linhas: string[] = doc.splitTextToSize(texto, larguraUtil);

  let y = margem;
  for (const linha of linhas) {
    if (y > alturaPagina - margem) {
      doc.addPage();
      y = margem;
    }
    doc.text(linha, margem, y);
    y += 7;
  }
  doc.save(`${nomeArquivo}.pdf`);
}