import { state, State } from "../core/state.js";
import { Events } from "../core/events.js";
import { saveReadingProgress, addNoteToBook } from "../services/bookService.js";

// EPUB ENGINE
let epubBook = null;
let epubRendition = null;
// =========================
// ENTRY POINT
// =========================
export function openReadingRoom(book, notes = []) {
    const reader = document.getElementById("reading-chamber");
    const viewer = document.getElementById("viewer");
    const title = document.getElementById("reader-book-title");

    reader.classList.remove("hidden");

    title.textContent = book.title;

    State.openReader(book);

    // clear previous view
    viewer.innerHTML = "";

    // decide rendering mode
    if (book.fileType === "pdf") {
        renderPDF(book, viewer);
    } else {
        renderEPUB(book, viewer);
    }

    renderNotes(notes);

    Events.emit("reader:opened", { book });
}
// =========================
// EPUB RENDERING
// =========================
async function renderEPUB(book, container) {
    try {
        const ePub = window.ePub;

        epubBook = ePub(book.fileUrl);

        epubRendition = epubBook.renderTo(container, {
            width: "100%",
            height: "100%"
        });

        await epubRendition.display();

        setupEPUBNavigation();
        setupEPUBProgress(book);

    } catch (err) {
        console.error("EPUB render failed:", err);
        container.innerHTML = "<p>Failed to load EPUB file.</p>";
    }
}
// =========================
// PDF RENDERING (FALLBACK MODE)
// =========================
async function renderPDF(book, container) {
    try {
        // Uses PDF.js via CDN (must be loaded in index.html if used)
        const pdfjsLib = window.pdfjsLib;

        if (!pdfjsLib) {
            container.innerHTML = "<p>PDF engine not loaded.</p>";
            return;
        }

        const loadingTask = pdfjsLib.getDocument(book.fileUrl);
        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        container.appendChild(canvas);

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        State.updateReaderProgress({
            location: 1,
            percent: 0
        });

        Events.emit("reader:pdf:loaded", { book });

    } catch (err) {
        console.error("PDF render failed:", err);
        container.innerHTML = "<p>Failed to load PDF file.</p>";
    }
}
// =========================
// EPUB NAVIGATION
// =========================
function setupEPUBNavigation() {
    document.getElementById("next-page").onclick = () => {
        epubRendition.next();
    };

    document.getElementById("prev-page").onclick = () => {
        epubRendition.prev();
    };
}
// =========================
// PROGRESS TRACKING (EPUB)
// =========================
function setupEPUBProgress(book) {
    if (!epubRendition) return;
    epubRendition.on("relocated", (location) => {
        const percent = epubRendition.location.percentage * 100;

        State.updateReaderProgress({
            location: location.start.cfi,
            percent
        });

        saveReadingProgress(book.id, location.start.cfi, percent);

        Events.emit("reader:progress", {
            bookId: book.id,
            percent
        });
    });
}
// =========================
// NOTES RENDERING
// =========================
function renderNotes(notes = []) {
    const list = document.getElementById("notes-list");
    list.innerHTML = "";

    for (const note of notes) {
        const card = document.createElement("div");
        card.className = "note-card";

        card.textContent = note.text || note.content || "";

        list.appendChild(card);
    }
}
// =========================
// NOTE CREATION (FROM UI)
// =========================
export async function attachNote() {
    const textarea = document.getElementById("note-text");
    const content = textarea.value.trim();

    if (!content || !state.activeBook) return;

    const cfi = state.reader.location;

    const note = await addNoteToBook(state.activeBook.id, content, cfi);

    textarea.value = "";

    Events.emit("note:added", {
        note
    });

    return note;
}
// =========================
// READER CONTROLS SETUP
// =========================
export function setupReaderControls() {
    document.getElementById("close-reader").onclick = () => {
        const reader = document.getElementById("reading-chamber");

        reader.classList.add("hidden");

        State.closeReader();

        if (epubRendition) {
            epubRendition.destroy();
            epubRendition = null;
            epubBook = null;
        }
        Events.emit("reader:closed");
    };
    document.getElementById("save-note-btn").onclick = attachNote;
}
