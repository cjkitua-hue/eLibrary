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

    const viewerContainer = document.getElementById('viewer');
    viewerContainer.innerHTML = ''; // Clear previous renders
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (bookData.file_type === 'pdf') {
        // --- PDF RENDERING ---
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        
        const pdfFrame = document.createElement('iframe');
        pdfFrame.src = `${bookData.file_url}#toolbar=0`; 
        pdfFrame.style.width = '100%';
        pdfFrame.style.height = '100%';
        pdfFrame.style.border = 'none';
        
        viewerContainer.appendChild(pdfFrame);

    } else {
        // --- EPUB RENDERING ---
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        
        currentBookInstance = ePub(bookData.file_url);
        const rendition = currentBookInstance.renderTo("viewer", {
            width: "100%",
            height: "100%",
            spread: "none"
        });

        const startingPoint = bookData.current_location_cfi || undefined;
        await rendition.display(startingPoint);

        prevBtn.onclick = () => rendition.prev();
        nextBtn.onclick = () => rendition.next();

        rendition.on('relocated', async (location) => {
            const currentCfi = location.start.cfi;
            const progressFraction = currentBookInstance.locations.percentageFromCfi(currentCfi);
            const progressPercentage = Math.floor(progressFraction * 100) || 0;
            
            await updateBookLocation(rendezvousBookId, currentCfi, progressPercentage);
        });

        currentBookInstance.ready.then(() => {
            return currentBookInstance.locations.generate(1024); 
        });
    }
}

function renderSingleNote(note) {
    const notesContainer = document.getElementById('notes-list');
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `<div>${note.content}</div><small style="opacity:0.6;">${new Date(note.created_at).toLocaleDateString()}</small>`;
    notesContainer.prepend(card);
}
