import { createRequire } from "node:module";
import path from "node:path";
import { strict as invariant } from "node:assert";
import Canvas from "canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

/** ~288 DPI for faithful PDF → image output */
export const PDF_RENDER_SCALE = 4;

const { AnnotationMode } = pdfjs;

class NodeCanvasFactory {
  create(width, height) {
    invariant(width > 0 && height > 0, "Invalid canvas size");
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    invariant(width > 0 && height > 0, "Invalid canvas size");
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/**
 * Render PDF pages with print intent + annotations so permits,
 * QR codes, and filled fields match desktop PDF viewers.
 */
export async function renderPdfToPngPages(pdfPath, scale = PDF_RENDER_SCALE) {
  const pdfjsPath = path.dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));
  const canvasFactory = new NodeCanvasFactory();

  const pdfDocument = await pdfjs.getDocument({
    standardFontDataUrl: path.join(pdfjsPath, `standard_fonts${path.sep}`),
    cMapUrl: path.join(pdfjsPath, `cmaps${path.sep}`),
    cMapPacked: true,
    isEvalSupported: false,
    canvasFactory,
    url: pdfPath,
  }).promise;

  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, viewport.width, viewport.height);

    await page.render({
      canvasContext: context,
      viewport,
      intent: "print",
      annotationMode: AnnotationMode.ENABLE,
    }).promise;

    pages.push(canvas.toBuffer("image/png"));
  }

  return pages;
}
