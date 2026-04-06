import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Robust Vite-compatible worker loading
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({
          data: typedarray,
          useSystemFonts: true,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        }).promise;
        
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ').trim();
          
          if (pageText.length > 0) {
            fullText += pageText + ' ';
          } else {
            // No text extracted by PDF.js - could be an image or scanned document.
            // Setup canvas for OCR
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };

            await page.render(renderContext).promise;
            
            // Convert to format Tesseract.js accepts
            const imageData = canvas.toDataURL('image/png');
            
            console.log(`Page ${pageNum} has no text. Running OCR...`);
            const { data: { text } } = await Tesseract.recognize(
              imageData,
              'eng'
              // Optionally log progress: { logger: m => console.log(m) }
            );
            
            fullText += text + ' ';
          }
        }
        
        resolve(fullText.trim());
      } catch (error) {
        console.error("PDF Parsing Error: ", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
