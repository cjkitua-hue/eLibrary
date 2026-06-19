import { state } from "../core/state.js";
import { Events } from "../core/events.js";
// =========================
// SEARCH CONFIG
// =========================
const SEARCH_CONFIG = {
    minQueryLength: 2
};
// =========================
// INTERNAL HELPERS
// =========================
function normalize(text = "") {
    return text.toLowerCase().trim();
}
// =========================
// CORE SEARCH FUNCTION
// =========================
export function searchLibrary(query) {
    const q = normalize(query);

    if (!q || q.length < SEARCH_CONFIG.minQueryLength) {
        return {
            books: [],
            shelves: [],
            wings: []
        };
    }

    const books = [];
    const shelves = [];
    const wings = [];
    // -------------------------
    // SEARCH BOOKS
    // -------------------------
    for (const book of Object.values(state.notes.byBookId || {})) {
        // placeholder safety (not used directly)
    }
    for (const shelf of state.shelves || []) {
        for (const bookId of shelf.bookIds || []) {
            const book = findBookById(bookId);
            if (!book) continue;

            if (
                normalize(book.title).includes(q) ||
                normalize(book.author).includes(q)
            ) {
                books.push(book);
            }
        }
    }
    // -------------------------
    // SEARCH SHELVES
    // -------------------------
    for (const shelf of state.shelves || []) {
        if (
            normalize(shelf.name).includes(q) ||
            normalize(shelf.description).includes(q)
        ) {
            shelves.push(shelf);
        }
    }
    // -------------------------
    // SEARCH WINGS
    // -------------------------
    for (const wing of state.wings || []) {
        if (
            normalize(wing.name).includes(q) ||
            normalize(wing.description).includes(q)
        ) {
            wings.push(wing);
        }
    }

    const result = { books, shelves, wings };

    Events.emit("search:performed", {
        query: q,
        result
    });

    return result;
}
// =========================
// BOOK LOOKUP (FAST ACCESS)
// =========================
function findBookById(id) {
    for (const shelf of state.shelves || []) {
        if (!shelf.bookIds) continue;

        if (shelf.bookIds.includes(id)) {
            // book must exist in normalized structure (future: book index)
            return state.books?.find?.(b => b.id === id) || null;
        }
    }

    return null;
}
// =========================
// FILTER HELPERS
// =========================
export function getBooksByWing(wingId) {
    const shelfIds = state.shelves
        .filter(s => s.wingId === wingId)
        .map(s => s.id);

    return state.books?.filter(b => shelfIds.includes(b.shelfId)) || [];
}
export function getBooksByShelf(shelfId) {
    return state.books?.filter(b => b.shelfId === shelfId) || [];
}
export function getRecentlyRead(limit = 10) {
    return (state.books || [])
        .slice()
        .sort((a, b) => {
            const aTime = new Date(a.lastReadAt || 0).getTime();
            const bTime = new Date(b.lastReadAt || 0).getTime();
            return bTime - aTime;
        })
        .slice(0, limit);
}
// =========================
// SEARCH TRIGGER (UI FRIENDLY)
// =========================
export function triggerSearch(query) {
    const result = searchLibrary(query);

    Events.emit("search:updated", result);

    return result;
}
