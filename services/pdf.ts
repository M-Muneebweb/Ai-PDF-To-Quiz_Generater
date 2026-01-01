import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use the CDN version to ensure compatibility without complex build configs for the worker file
// We match the version from package.json (3.11.174)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    let fullText = '';
    
    // Limit pages to prevent browser crash on massive docs
    const maxPages = Math.min(pdfDoc.numPages, 20); 

    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            // @ts-ignore - str exists on TextItem
            .map((item) => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
      } catch (pageError) {
        console.warn(`Skipping page ${i} due to error`, pageError);
      }
    }

    if (!fullText.trim()) {
        throw new Error("No text found in PDF. It might be scanned/image-based.");
    }

    return fullText.trim();
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    if (error.name === 'MissingPDFException') {
        throw new Error('The file appears to be invalid.');
    }
    if (error.message && error.message.includes('No text found')) {
        throw error;
    }
    throw new Error('Failed to process PDF. Please try a different file.');
  }
};