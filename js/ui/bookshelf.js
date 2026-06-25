import { state } from "../core/state.js";
import { Events } from "../core/events.js";
import { openBook } from "../services/bookService.js";
// =========================
// MAIN RENDER ENTRY POINT
// =========================
export function renderWings(libraryData, container) {
    container.innerHTML = "";

    const wings = libraryData.wings || [];

    for (const wing of wings) {
        const wingEl = createWingElement(wing, libraryData.shelves, libraryData.books);
        container.appendChild(wingEl);
    }

    Events.emit("ui:bookshelf:rendered");
}
// =========================
// WING RENDER
// =========================
function createWingElement(wing, shelves, books) {
    const wingEl = document.createElement("section");
    wingEl.className = "wing";

    const title = document.createElement("h2");
    title.textContent = wing.name;

    wingEl.appendChild(title);

    const wingShelves = shelves.filter(s => s.wingId === wing.id);

    for (const shelf of wingShelves) {
        const shelfEl = createShelfElement(shelf, books);
        wingEl.appendChild(shelfEl);
    }

    return wingEl;
}
// =========================
// SHELF RENDER
// =========================
function createShelfElement(shelf, books) {
    const shelfEl = document.createElement("div");
    shelfEl.className = "shelf";

    const shelfTitle = document.createElement("h3");
    shelfTitle.textContent = shelf.name;

    const booksLine = document.createElement("div");
    booksLine.className = "books-line";

    const shelfBooks = books.filter(b => b.shelfId === shelf.id);

    for (const book of shelfBooks) {
        const bookEl = createBookElement(book);
        booksLine.appendChild(bookEl);
    }

    shelfEl.appendChild(shelfTitle);
    shelfEl.appendChild(booksLine);

    return shelfEl;
}
// =========================
// BOOK RENDER (SPINE CARD)
// =========================
function createBookElement(book) {
    const card = document.createElement("div");
    card.className = "book-card book-spine";
    card.dataset.id = book.id;

    // cover
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.textContent = book.title;

    // author
    const author = document.createElement("small");
    author.textContent = book.author;

    // progress bar
    const progress = document.createElement("div");
    progress.className = "progress-bar";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${book.progress || 0}%`;

    progress.appendChild(fill);

    card.appendChild(cover);
    card.appendChild(author);
    card.appendChild(progress);

    return card;
}
// =========================
// EVENT DELEGATION (BOOK OPEN)
// =========================
export function setupBookshelfInteractions(container) {
    container.addEventListener("click", async (e) => {
        const bookCard = e.target.closest(".book-spine");

        if (!bookCard) return;

        const bookId = bookCard.dataset.id;

        bookCard.style.opacity = "0.6";

        try {
            await openBook(bookId);

            Events.emit("ui:book:opened", { bookId });
        } catch (err) {
            console.error("Failed to open book:", err);
            bookCard.style.opacity = "1";
        }
    });
}
// =========================
// STATE-DRIVEN RE-RENDER (FUTURE USE)
// =========================
export function rerenderFromState(container) {
    const { wings, shelves, books } = state;

    renderWings({ wings, shelves, books }, container);
}
