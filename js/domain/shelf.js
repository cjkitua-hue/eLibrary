// =========================
// SHELF MODEL
// =========================
export function createShelf(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),

        // identity
        name: data.name || "Untitled Shelf",
        description: data.description || "",

        // relationship
        wingId: data.wing_id || null,

        // contents
        bookIds: data.book_ids || [],

        // optional organization rules
        sortMode: data.sort_mode || "manual", 
        // manual | title | author | progress | newest

        // UI/state flags
        isActive: data.is_active || false,

        createdAt: data.created_at || new Date().toISOString()
    };
}
// =========================
// SHELF OPERATIONS (PURE)
// =========================
export const Shelf = {
    addBook(shelf, bookId) {
        if (shelf.bookIds.includes(bookId)) return shelf;

        return {
            ...shelf,
            bookIds: [...shelf.bookIds, bookId]
        };
    },
    removeBook(shelf, bookId) {
        return {
            ...shelf,
            bookIds: shelf.bookIds.filter(id => id !== bookId)
        };
    },
    setActive(shelf, isActive = true) {
        return {
            ...shelf,
            isActive
        };
    },
    setSortMode(shelf, mode) {
        const allowedModes = ["manual", "title", "author", "progress", "newest"];

        if (!allowedModes.includes(mode)) {
            console.warn(`Invalid sort mode: ${mode}`);
            return shelf;
        }

        return {
            ...shelf,
            sortMode: mode
        };
    },
    reorderBooks(shelf, newOrder) {
        // newOrder must be an array of bookIds
        const validOrder = newOrder.filter(id => shelf.bookIds.includes(id));

        if (validOrder.length !== shelf.bookIds.length) {
            console.warn("Reorder mismatch: some book IDs missing or invalid");
        }
        return {
            ...shelf,
            bookIds: validOrder
        };
    }
};
