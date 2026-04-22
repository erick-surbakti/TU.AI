// src/lib/pdf-export.ts
// Client-side PDF export via html2canvas + jsPDF
// Only import in client components — never in server components or flows

export interface PdfExportOptions {
  /** The DOM element to snapshot */
  element: HTMLElement;
  /** Filename without extension */
  filename?: string;
  /** Scale factor for resolution (default 2) */
  scale?: number;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Export a DOM element as a multi-page PDF.
 * Dynamically imports html2canvas and jsPDF so they're never
 * bundled into the server-side module graph.
 */
export async function exportElementAsPdf(
  opts: PdfExportOptions
): Promise<void> {
  const {
    element,
    filename = "pathfinder-report",
    scale = 2,
    onStart,
    onSuccess,
    onError,
  } = opts;

  try {
    onStart?.();

    // Dynamic imports — client only
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    // Snapshot the element
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // Expand to full scroll height
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Calculate image height to maintain aspect ratio
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const imgHeightMm = (imgHeightPx / imgWidthPx) * pdfWidth;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // If content fits one page
    if (imgHeightMm <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightMm);
    } else {
      // Split into multiple pages
      let yOffset = 0;
      let pageCount = 0;

      while (yOffset < imgHeightMm) {
        if (pageCount > 0) pdf.addPage();

        // Clip y so we don't go past image
        const sliceHeight = Math.min(pdfHeight, imgHeightMm - yOffset);

        pdf.addImage(
          imgData,
          "PNG",
          0,
          -yOffset,
          pdfWidth,
          imgHeightMm
        );

        yOffset += pdfHeight;
        pageCount++;
      }
    }

    // Timestamp in filename
    const dateSuffix = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    pdf.save(`${filename}-${dateSuffix}.pdf`);
    onSuccess?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("PDF export failed:", error);
    onError?.(error);
  }
}