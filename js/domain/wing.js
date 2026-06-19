// =========================
// WING MODEL
// =========================
export function createWing(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),

        name: data.name || "Untitled Wing",
        description: data.description || "",

        // organizational structure
        shelfIds: data.shelf_ids || [],

        // optional UI state
        isActive: data.is_active || false,

        createdAt: data.created_at || new Date().toISOString()
    };
}
// =========================
// WING OPERATIONS (PURE)
// =========================
export const Wing = {
    addShelf(wing, shelfId) {
        if (wing.shelfIds.includes(shelfId)) return wing;

        return {
            ...wing,
            shelfIds: [...wing.shelfIds, shelfId]
        };
    },
    removeShelf(wing, shelfId) {
        return {
            ...wing,
            shelfIds: wing.shelfIds.filter(id => id !== shelfId)
        };
    },
    setActive(wing, isActive = true) {
        return { ...wing, isActive };
    }
};
