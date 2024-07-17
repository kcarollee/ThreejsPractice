// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // URL of the PDF file
    const pdfUrl = './pdftest.pdf';
    console.log(window)
    // Initialize PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    // Set worker URL to the PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    // Fetch the PDF document
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        const totalPages = pdf.numPages;
        const flipbookContainer = document.getElementById('flipbook');

        // Loop through each page and add to flipbook container
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const pageElement = document.createElement('div');
            const canvas = document.createElement('canvas');
            pageElement.className = 'page'; // Apply styles for page size and formatting
            pageElement.appendChild(canvas);
            flipbookContainer.appendChild(pageElement);

            // Render PDF page to canvas using PDF.js
            pdf.getPage(pageNum).then(page => {
                const viewport = page.getViewport({ scale: 1.5 });
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page to canvas
                page.render({
                    canvasContext: context,
                    viewport: viewport
                });

                // Add a class to the first and last page
                if (pageNum === 1) {
                    pageElement.classList.add('first-page');
                } else if (pageNum === totalPages) {
                    pageElement.classList.add('last-page');
                }
            });
        }

        // Initialize turn.js after all pages are added
        const flipbook = $(flipbookContainer);
        flipbook.turn({
            width: '100%',
            height: '100%',
            autoCenter: true
        });

    }).catch(error => {
        console.error('Error loading PDF: ' + error);
    });
});
