import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configurar el worker de PDF.js utilizando la URL empaquetada por Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Carga un archivo PDF en memoria y devuelve la instancia del documento y metadatos básicos.
 * @param {File} file - Archivo seleccionado por el usuario en el navegador
 * @returns {Promise<{ pdfDoc: any, numPages: number, nombre: string, tamanoKb: number }>}
 */
export async function cargarPdf(file) {
  if (!file) throw new Error('No se ha proporcionado ningún archivo.');
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('El archivo seleccionado no es un PDF válido.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  return {
    pdfDoc,
    numPages: pdfDoc.numPages,
    nombre: file.name,
    tamanoKb: Math.round(file.size / 1024),
  };
}

/**
 * Extrae el texto plano de un rango de páginas de un documento PDF.
 * @param {any} pdfDoc - Instancia de PDFDocumentProxy cargada
 * @param {number} desde - Página inicial (1-indexed)
 * @param {number} hasta - Página final (1-indexed, inclusiva)
 * @param {Function} [onProgress] - Callback opcional ({ paginaActual, progresoPorcentaje })
 * @returns {Promise<{ texto: string, esEscaneado: boolean, totalPaginasExtraidas: number }>}
 */
export async function extraerTextoDeRango(pdfDoc, desde, hasta, onProgress) {
  const minPag = Math.max(1, Math.min(desde, pdfDoc.numPages));
  const maxPag = Math.max(minPag, Math.min(hasta, pdfDoc.numPages));
  const totalRango = maxPag - minPag + 1;

  const bloquesTexto = [];

  for (let i = minPag; i <= maxPag; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();

    // Reconstruir texto respetando saltos de línea e items
    const lineas = [];
    let lineaActual = '';

    for (const item of content.items) {
      if (item.hasEOL) {
        lineaActual += item.str;
        if (lineaActual.trim()) lineas.push(lineaActual.trim());
        lineaActual = '';
      } else {
        lineaActual += (lineaActual ? ' ' : '') + item.str;
      }
    }
    if (lineaActual.trim()) lineas.push(lineaActual.trim());

    const textoPagina = lineas.join('\n');
    if (textoPagina.trim()) {
      bloquesTexto.push(`--- Página ${i} ---\n${textoPagina}`);
    }

    if (onProgress) {
      const progreso = Math.round(((i - minPag + 1) / totalRango) * 100);
      onProgress({ paginaActual: i, progresoPorcentaje: progreso });
    }
  }

  const textoFinal = bloquesTexto.join('\n\n').trim();

  // Si tras extraer no hay caracteres alfanuméricos relevantes, es un PDF escaneado (imágenes)
  const caracteresAlfanumericos = textoFinal.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '').length;
  const esEscaneado = caracteresAlfanumericos < 30;

  return {
    texto: textoFinal,
    esEscaneado,
    totalPaginasExtraidas: totalRango,
  };
}
