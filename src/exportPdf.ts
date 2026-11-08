// pdf-exporter.ts
import { PDFExportOptions } from './types';

// Declaração dos tipos das bibliotecas externas
declare const jsPDF: any;
declare const html2canvas: any;

/**
 * Classe responsável pela exportação do conteúdo do editor para PDF
 * Utiliza html2canvas para capturar o conteúdo e jsPDF para gerar o arquivo
 */
export class PDFExporter {
  private defaultOptions: PDFExportOptions;

  constructor() {
    this.defaultOptions = {
      filename: 'documento.pdf',
      format: 'a4',
      orientation: 'portrait',
      margin: 20,
      scale: 2
    };
  }

  /**
   * Verifica se as bibliotecas necessárias estão disponíveis
   */
  private checkDependencies(): void {
    if (typeof jsPDF === 'undefined') {
      throw new Error('jsPDF não está disponível. Certifique-se de incluir a biblioteca.');
    }
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas não está disponível. Certifique-se de incluir a biblioteca.');
    }
  }

  /**
   * Prepara o elemento para captura (estilização temporária)
   */
  private prepareElement(element: HTMLElement): { originalStyles: string; clonedElement: HTMLElement } {
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Aplica estilos otimizados para PDF
    clonedElement.style.width = '210mm'; // Largura A4
    clonedElement.style.padding = '20mm';
    clonedElement.style.background = '#ffffff';
    clonedElement.style.color = '#000000';
    clonedElement.style.fontFamily = 'Georgia, serif';
    clonedElement.style.fontSize = '12pt';
    clonedElement.style.lineHeight = '1.6';
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';

    // Remove highlights de busca
    const highlights = clonedElement.querySelectorAll('.highlight');
    highlights.forEach(h => {
      const parent = h.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(h.textContent || ''), h);
      }
    });

    document.body.appendChild(clonedElement);

    return { originalStyles: element.style.cssText, clonedElement };
  }

  /**
   * Remove o elemento temporário após captura
   */
  private cleanup(clonedElement: HTMLElement): void {
    if (clonedElement.parentNode) {
      clonedElement.parentNode.removeChild(clonedElement);
    }
  }

  /**
   * Divide o canvas em páginas A4
   */
  private splitCanvasToPages(canvas: HTMLCanvasElement, format: string, orientation: string, margin: number): { canvas: HTMLCanvasElement; height: number }[] {
    const pages: { canvas: HTMLCanvasElement; height: number }[] = [];

    // Dimensões em pixels (considerando scale)
    const pageWidth = orientation === 'portrait' ? 794 : 1123; // A4 em pixels @96dpi
    const pageHeight = orientation === 'portrait' ? 1123 : 794;
    const marginPixels = Math.floor(margin * 3.78); // mm para pixels

    const usableWidth = pageWidth - (marginPixels * 2);
    const usableHeight = pageHeight - (marginPixels * 2);

    const totalHeight = canvas.height;
    const totalPages = Math.ceil(totalHeight / usableHeight);

    for (let i = 0; i < totalPages; i++) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = pageWidth;
      pageCanvas.height = pageHeight;

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) continue;

      // Fundo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);

      // Copia a porção do canvas original
      const sourceY = i * usableHeight;
      const sourceHeight = Math.min(usableHeight, totalHeight - sourceY);

      ctx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight, // Origem
        marginPixels, marginPixels, usableWidth, sourceHeight // Destino
      );

      pages.push({ canvas: pageCanvas, height: sourceHeight });
    }

    return pages;
  }

  /**
   * Exporta o conteúdo do editor para PDF
   */
  async exportToPDF(
    element: HTMLElement,
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    this.checkDependencies();

    const finalOptions = { ...this.defaultOptions, ...options };

    try {
      // Prepara o elemento
      const { clonedElement } = this.prepareElement(element);

      // Aguarda um frame para garantir que os estilos foram aplicados
      await new Promise(resolve => setTimeout(resolve, 100));

      // Captura o elemento como canvas
      const canvas = await html2canvas(clonedElement, {
        scale: finalOptions.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove o elemento temporário
      this.cleanup(clonedElement);

      // Cria o documento PDF
      const pdf = new jsPDF({
        orientation: finalOptions.orientation,
        unit: 'mm',
        format: finalOptions.format
      });

      // Divide em páginas
      const pages = this.splitCanvasToPages(
        canvas,
        finalOptions.format,
        finalOptions.orientation,
        finalOptions.margin
      );

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Adiciona cada página ao PDF
      pages.forEach((page, index) => {
        if (index > 0) {
          pdf.addPage();
        }

        const imgData = page.canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      });

      // Salva o PDF
      pdf.save(finalOptions.filename);

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }

  /**
   * Exporta apenas o texto (sem formatação) para PDF
   */
  async exportTextToPDF(
    text: string,
    options: Partial<PDFExportOptions> = {}
  ): Promise<void> {
    this.checkDependencies();

    const finalOptions = { ...this.defaultOptions, ...options };

    try {
      const pdf = new jsPDF({
        orientation: finalOptions.orientation,
        unit: 'mm',
        format: finalOptions.format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = finalOptions.margin;
      const lineHeight = 6;
      const maxWidth = pageWidth - (margin * 2);

      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);

      const lines = pdf.splitTextToSize(text, maxWidth);
      let y = margin;

      lines.forEach((line: string) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      });

      pdf.save(finalOptions.filename);
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao exportar texto para PDF:', error);
      throw error;
    }
  }
}

// Exporta uma instância singleton
export const pdfExporter = new PDFExporter();