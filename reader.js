import { updateBookLocation, createMarginNote } from '../api/supabase.js';

let currentBookInstance = null;
let rendezvousBookId = null;

export async function openReadingRoom(bookData, existingNotes) {
    rendezvousBookId = bookData.id;
    document.getElementById('library-view').classList.add('hidden');
    document.getElementById('reading-room').classList.remove('hidden');
    document.getElementById('reader-book-title').textContent = bookData.title;

    // Render historical notes
    const notesContainer = document.getElementById('notes-list');
    notesContainer.innerHTML = '';
    existingNotes.forEach(renderSingleNote);

    // Instantiate Epub.js Book Object
    currentBookInstance = ePub(bookData.file_url);
    const rendition = currentBookInstance.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none"
    });

    // Jump straight to their last synchronized location
    const startingPoint = bookData.current_location_cfi || undefined;
    await rendition.display(startingPoint);

    // Page Turning Mechanics
    document.getElementById('prev-page').onclick = () => rendition.prev();
    document.getElementById('next-page').onclick = () => rendition.next();

    // Listen to location changes to update bookmark variables natively
    rendition.on('relocated', async (location) => {
        const currentCfi = location.start.cfi;
        // Generate current structural percentage progression
        const progressFraction = currentBookInstance.locations.percentageFromCfi(currentCfi);
        const progressPercentage = Math.floor(progressFraction * 100) || 0;
        
        await updateBookLocation(rendezvousBookId, currentCfi, progressPercentage);
    });

    // Generate location index in the background to handle precise linear progress tracking
    currentBookInstance.ready.then(() => {
        return currentBookInstance.locations.generate(1024); 
    });
}

export function setupReaderControls() {
    // Back to library handler
    document.getElementById('close-reader').addEventListener('click', () => {
        if (currentBookInstance) currentBookInstance.destroy();
        document.getElementById('reading-room').classList.add('hidden');
        document.getElementById('library-view').classList.remove('hidden');
        window.location.reload(); // Refresh hierarchy positions instantly
    });

    // Saving individual notes event listener
    document.getElementById('save-note-btn').onclick = async () => {
        const inputField = document.getElementById('note-text');
        const content = inputField.value.trim();
        if (!content) return;

        const newNote = await createMarginNote(rendezvousBookId, content);
        if (newNote) {
            renderSingleNote(newNote);
            inputField.value = '';
        }
    };
}

function renderSingleNote(note) {
    const notesContainer = document.getElementById('notes-list');
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `<div>${note.content}</div><small style="opacity:0.6;">${new Date(note.created_at).toLocaleDateString()}</small>`;
    notesContainer.prepend(card);
}
