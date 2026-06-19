// =========================
// BOOK MODEL
// =========================
export function createBook(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),

        // core metadata
        title: data.title || "Untitled Volume",
        author: data.author || "Unknown Origin",

        // storage
        fileUrl: data.file_url || null,
        coverUrl: data.cover_image_url || null,
        fileType: data.file_type || "epub", // epub | pdf

        // classification
        wingId: data.wing_id || null,
        shelfId: data.shelf_id || null,

        // reading progress
        progress: data.progress_percentage || 0,

        // timestamps
        createdAt: data.created_at || new Date().toISOString(),

        // optional metadata
        tags: data.tags || []
    };
}
// =========================
// BOOK OPERATIONS (PURE)
// =========================
export const Book = {
    updateProgress(book, percent) {
        return { ...book, progress: percent };
    },

    assignShelf(book, shelfId) {
        return { ...book, shelfId };
    },

    assignWing(book, wingId) {
        return { ...book, wingId };
    }
};
