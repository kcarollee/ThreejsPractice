document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.scroll-container');
    const gridContainer = document.getElementById('grid-container');
    
    // Scroll the container to the middle
    function initialScrollSetup() {
        scrollContainer.scrollLeft = gridContainer.scrollWidth / 3; // Start at 1/3 to leave room for scrolling in both directions
    }

    function handleScroll() {
        const maxScrollLeft = gridContainer.scrollWidth - scrollContainer.clientWidth;

        if (scrollContainer.scrollLeft <= 0) {
            // Jump to the right side duplicate images
            scrollContainer.scrollLeft = maxScrollLeft / 3;
        } else if (scrollContainer.scrollLeft >= maxScrollLeft) {
            // Jump to the left side duplicate images
            scrollContainer.scrollLeft = maxScrollLeft / 3 * 2;
        }
    }

    // Attach the scroll event listener
    scrollContainer.addEventListener('scroll', handleScroll);

    // Initial setup for scroll position
    initialScrollSetup();
});