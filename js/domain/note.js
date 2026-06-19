// =========================
// NOTE MODEL
// =========================
export function createNote(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),

        bookId: data.book_id || null,

        text: data.text || "",

        // reading position anchor
        cfi: data.cfi || null, // epub location (important for EPUB.js)
        page: data.page || null,

        // metadata
        createdAt: data.created_at || new Date().toISOString(),

        // optional categorization
        tags: data.tags || []
    };
}
// =========================
// NOTE OPERATIONS (PURE)
// =========================
export const Note = {
    updateText(note, text) {
        return { ...note, text };
    },
    attachToLocation(note, { cfi, page }) {
        return {
            ...note,
            cfi: cfi ?? note.cfi,
            page: page ?? note.page
        };
    }
};
