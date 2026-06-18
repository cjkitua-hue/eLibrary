import { fetchLibraryHierarchy, fetchBookDetails, fetchAllShelves, insertNewBook, uploadLibraryFile } from './api/supabase.js';
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
        
        const submitBtn = document.getElementById('catalog-submit-btn');
        submitBtn.textContent = 'Uploading to Archives...';
        submitBtn.disabled = true;

        try {
            const bookFile = document.getElementById('new-book-file').files[0];
            const coverFile = document.getElementById('new-cover-file').files[0];
            
            const fileExtension = bookFile.name.split('.').pop().toLowerCase();
            const fileType = fileExtension === 'pdf' ? 'pdf' : 'epub';

            let finalBookUrl = '';
            let finalCoverUrl = null;

            if (bookFile) {
                finalBookUrl = await uploadLibraryFile('books', bookFile);
            }

            if (coverFile) {
                finalCoverUrl = await uploadLibraryFile('covers', coverFile);
            }

            const newBook = {
                title: document.getElementById('new-title').value.trim(),
                author: document.getElementById('new-author').value.trim(),
                file_url: finalBookUrl,
                cover_image_url: finalCoverUrl,
                shelf_id: shelfSelect.value,
                file_type: fileType,
                progress_percentage: 0
            };

            const result = await insertNewBook(newBook);
            if (result) {
                alert('Volume permanently archived in library vaults!');
                window.location.reload();
            }
        } catch (error) {
            alert('Failed to catalog the book. Check the console for details.');
            console.error(error);
            submitBtn.textContent = 'Catalog Book';
            submitBtn.disabled = false;
        }
    });

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
