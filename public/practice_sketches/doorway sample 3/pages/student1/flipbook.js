// Initialize the PDF.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// URL of the PDF file
const url = './pdftest2.pdf';

// Fetch the PDF document
pdfjsLib.getDocument(url).promise.then(pdf => {
    const flipbook = document.getElementById('flipbook');

      // Function to render a page at its native resolution
    const renderPage = (page, container) => {
        // Get the viewport at 100% scale
        const viewport = page.getViewport({ scale: 1 });

        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');

        // Render the page on the canvas
        console.log(page._pageInfo.view[2])
        page.render({
            canvasContext: context,
            viewport: viewport
        }).promise.then(() => {
            // Append the canvas to the container
            container.appendChild(canvas);
        });
    };



    // Create pages for the flipbook
    const pageDivArr = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.pageNum = pageNum;
        pageDivArr.push(pageDiv);
        pageDiv.style.zIndex = pdf.numPages - pageNum; // Ensure proper stacking order
        flipbook.appendChild(pageDiv);

        if (pageNum === 1) {
            pageDiv.classList.add('right');
        } else if (pageNum % 2 === 1) {
            pageDiv.classList.add('right');
        } else if (pageNum % 2 === 0) {
            pageDiv.classList.add('left');
            //pageDiv.classList.add('initial-flip');
        }
        //pageDiv.classList.add('flipped-counter');

        pdf.getPage(pageNum).then(page => renderPage(page, pageDiv));

        // Add click event listener to flip the page
        pageDiv.addEventListener('click', () => {
            // if (pageDiv.classList.contains('left')) {
            //     const prevPage = pageDiv.previousElementSibling;
            //     pageDiv.classList.toggle('flipped');
            //     if (prevPage) prevPage.classList.toggle('flipped');

            // } else if (pageDiv.classList.contains('right')) {
            //     const nextPage = pageDiv.nextElementSibling;
            //     pageDiv.classList.toggle('flipped');
            //     if (nextPage) {
            //         pageDiv.nextElementSibling.classList.add('flipped');
            //     }
            // }

            let index = pageDiv.pageNum - 1;
            console.log(index)
           // console.log(pageDiv === pageDivArr[index]);
            //pageDivArr[index].classList.toggle('flipped');
            pageDivArr[index].classList.toggle('flipped');
        });
    }
}).catch(error => {
    console.error('Error loading PDF: ' + error);
});