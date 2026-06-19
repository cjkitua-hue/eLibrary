// =========================
// GLOBAL LIBRARY STATE
// Single source of truth
// =========================
export const state = {
    // -------------------------
    // VIEW STATE
    // -------------------------
    currentView: "hall", // hall | reader | acquisition
    theme: "light", // light | midnight | velvet
    // -------------------------
    // LIBRARY STRUCTURE
    // -------------------------
    wings: [],
    shelves: [],
    // -------------------------
    // CURRENT SELECTION
    // -------------------------
    activeWingId: null,
    activeShelfId: null,
    activeBook: null,
    // -------------------------
    // READER STATE
    // -------------------------
    reader: {
        location: null, // epub location / page index
        percent: 0,
        isOpen: false
    },
    // -------------------------
    // NOTES CACHE
    // -------------------------
    notes: {
        byBookId: {}
    },
    // -------------------------
    // UI FLAGS
    // -------------------------
    ui: {
        intakeOpen: false
    }
};
// =========================
// STATE UPDATE HELPERS
// =========================
export const State = {
    setView(view) {
        state.currentView = view;
    },
    setTheme(theme) {
        state.theme = theme;
    },
    setLibrary({ wings = [], shelves = [] }) {
        state.wings = wings;
        state.shelves = shelves;
    },
    setActiveWing(id) {
        state.activeWingId = id;
    },
    setActiveShelf(id) {
        state.activeShelfId = id;
    },
    setActiveBook(book) {
        state.activeBook = book;
    },
    openReader(book) {
        state.activeBook = book;
        state.reader.isOpen = true;
    },
    closeReader() {
        state.reader.isOpen = false;
        state.activeBook = null;
        state.reader.location = null;
        state.reader.percent = 0;
    },
    updateReaderProgress({ location, percent }) {
        state.reader.location = location;
        state.reader.percent = percent;
    },
    toggleIntake() {
        state.ui.intakeOpen = !state.ui.intakeOpen;
    },
    setNotes(bookId, notes) {
        state.notes.byBookId[bookId] = notes;
    },
    addNote(bookId, note) {
        if (!state.notes.byBookId[bookId]) {
            state.notes.byBookId[bookId] = [];
        }
        state.notes.byBookId[bookId].push(note);
    }
};
