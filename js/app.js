import { fetchLibraryHierarchy, fetchBookDetails, fetchAllShelves, insertNewBook } from './api/supabase.js';
import { renderWings } from './ui/render.js';
import { openReadingRoom, setupReaderControls } from './ui/reader.js';

document.addEventListener('DOMContentLoaded', async () => {
    const wingsContainer = document.getElementById('wings-container');
    const themeToggle = document.getElementById('theme-toggle');
    const toggleIntakeBtn = document.getElementById('toggle-intake-btn');
    const intakePanel = document.getElementById('intake-panel');
    const addBookForm = document.getElementById('add-book-form');
    const shelfSelect = document.getElementById('shelf-select');

    // ==========================================
    // STEP 1: WIRE UP UI CONTROLS IMMEDIATELY
    // (This guarantees buttons work even if the DB is empty)
    // ==========================================
    setupReaderControls();

    // Toggle the Intake panel view drawer
    toggleIntakeBtn.addEventListener('click', () => {
        intakePanel.classList.toggle('hidden-panel');
    });

    // Handle theme switcher toggling
    themeToggle.addEventListener('click', () => {
        const active = document.body.getAttribute('data-theme') === 'midnight';
        active ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'midnight');
    });

    // Handle book cataloging form submission
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newBook = {
            title: document.getElementById('new-title').value.trim(),
            author: document.getElementById('new-author').value.trim(),
            file_url: document.getElementById('new-file-url').value.trim(),
            cover_image_url: document.getElementById('new-cover-url').value.trim() || null,
            shelf_id: shelfSelect.value,
            progress_percentage: 0
        };

        const result = await insertNewBook(newBook);
        if (result) {
            alert('Volume permanently archived in library vaults!');
            window.location.reload();
        }
    });

    // Global click listener for book clicks
    wingsContainer.addEventListener('click', async (e) => {
        const card = e.target.closest('.book-spine');
        if (card) {
            const bookId = card.dataset.id;
            card.style.opacity = '0.5';
            const dataPackage = await fetchBookDetails(bookId);
            openReadingRoom(dataPackage.book, dataPackage.notes);
        }
    });

    // ==========================================
    // STEP 2: LOAD ASYNCHRONOUS DATABASE DATA
    // ==========================================
    try {
        wingsContainer.innerHTML = '<p>Opening the vault...</p>';
        
        // Fetch library layout layout structure
        const libraryData = await fetchLibraryHierarchy();
        renderWings(libraryData, wingsContainer);

        // Populate form dropdown select selection menu
        const shelves = await fetchAllShelves();
        shelves.forEach(shelf => {
            const option = document.createElement('option');
            option.value = shelf.id;
            option.textContent = shelf.name;
            shelfSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Vault access initialization failed:", error);
        wingsContainer.innerHTML = '<p style="color: red; padding: 20px;">Could not connect to the vault. Please configure your keys in js/api/supabase.js.</p>';
    }
});
