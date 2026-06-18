import { fetchLibraryHierarchy, fetchBookDetails } from './api/supabase.js';
import { renderWings } from './ui/render.js';
import { openReadingRoom, setupReaderControls } from './ui/reader.js';

document.addEventListener('DOMContentLoaded', async () => {
    const wingsContainer = document.getElementById('wings-container');
    const themeToggle = document.getElementById('theme-toggle');

    // Initialize global control actions for reading room context
    setupReaderControls();

    // Render home deck hierarchy
    wingsContainer.innerHTML = '<p>Opening the vault...</p>';
    const libraryData = await fetchLibraryHierarchy();
    renderWings(libraryData, wingsContainer);

    // Event delegation setup to capture structural interactions dynamically
    wingsContainer.addEventListener('click', async (e) => {
        const card = e.target.closest('.book-spine');
        if (card) {
            const bookId = card.dataset.id; // Assign data-id="${book.id}" during render stage
            card.style.opacity = '0.5'; // Visual indication of processing
            
            const dataPackage = await fetchBookDetails(bookId);
            openReadingRoom(dataPackage.book, dataPackage.notes);
        }
    });

    // Theme Selector
    themeToggle.addEventListener('click', () => {
        const active = document.body.getAttribute('data-theme') === 'midnight';
        active ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'midnight');
    });
});
