const { PDFDocument, rgb } = require('pdf-lib');
const axios = require('axios');

const generateCombinedPdf = async (offerLetters) => {
  try {
    // Create combined PDF
    const combinedPdf = await PDFDocument.create();

    for (const { roll_no, fileId } of offerLetters) {
      if (!fileId) throw new Error(`Missing fileId for ${roll_no}`);
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      // Fetch PDF
      console.log(`Fetching PDF for ${roll_no}: ${downloadUrl}`);
      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const pdfDoc = await PDFDocument.load(response.data);

      // Add watermark
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        page.drawText(roll_no, {
          x: width / 2 - 50,
          y: height / 2,
          size: 40,
          opacity: 0.3,
          color: rgb(0.5, 0.5, 0.5),
          rotate: { type: 'degrees', angle: 45 },
        });
      }

      // Merge into combined PDF
      const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => combinedPdf.addPage(page));
    }

    // Return PDF bytes
    const pdfBytes = await combinedPdf.save();
    console.log('PDF generated in memory');
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error.message);
    throw error;
  }
};

module.exports = { generateCombinedPdf };
