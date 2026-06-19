import {
    getLibraryHierarchy,
    getShelves,
    getBookDetails,
    insertBook,
    updateBookProgress,
    markBookAsTBR,
    createNote,
    uploadFile
} from "./storage.js";

import { createBook, Book } from "../domain/book.js";
import { createShelf } from "../domain/shelf.js";
import { createWing } from "../domain/wing.js";
import { createNote as createNoteModel } from "../domain/note.js";

import { state, State } from "../core/state.js";
import { Events } from "../core/events.js";
// =========================
// INTERNAL TRANSFORMERS
// =========================
function normalizeWing(rawWing) {
    return createWing({
        id: rawWing.id,
        name: rawWing.name,
        description: rawWing.description,
        shelf_ids: rawWing.shelves?.map(s => s.id) || []
    });
}

function normalizeShelf(rawShelf) {
    return createShelf({
        id: rawShelf.id,
        name: rawShelf.name,
        wing_id: rawShelf.wing_id,
        book_ids: rawShelf.books?.map(b => b.id) || []
    });
}

function normalizeBook(rawBook) {
    return createBook({
        id: rawBook.id,
        title: rawBook.title,
        author: rawBook.author,
        file_url: rawBook.file_url,
        cover_image_url: rawBook.cover_image_url,
        file_type: rawBook.file_type,
        progress_percentage: rawBook.progress_percentage,
        shelf_id: rawBook.shelf_id
    });
}

function normalizeNote(rawNote) {
    return createNoteModel({
        id: rawNote.id,
        book_id: rawNote.book_id,
        text: rawNote.content,
        cfi: rawNote.cfi,
        created_at: rawNote.created_at
    });
}
// =========================
// LIBRARY INITIALIZATION
// =========================
export async function loadLibrary() {
    const raw = await getLibraryHierarchy();

    const wings = [];
    const shelves = [];
    const books = [];

    for (const wing of raw) {
        const w = normalizeWing(wing);
        wings.push(w);

        for (const shelf of wing.shelves || []) {
            const s = normalizeShelf({
                ...shelf,
                wing_id: wing.id
            });

            shelves.push(s);

            for (const book of shelf.books || []) {
                const b = normalizeBook({
                    ...book,
                    shelf_id: shelf.id
                });

                books.push(b);
            }
        }
    }

    State.setLibrary({ wings, shelves });

    Events.emit("library:loaded", {
        wings,
        shelves,
        books
    });

    return { wings, shelves, books };
}
// =========================
// SINGLE BOOK FETCH
// =========================
export async function openBook(bookId) {
    const data = await getBookDetails(bookId);

    if (!data?.book) return null;

    const book = normalizeBook(data.book);
    const notes = (data.notes || []).map(normalizeNote);

    State.setActiveBook(book);
    State.setNotes(book.id, notes);
    State.openReader(book);

    Events.emit("book:opened", {
        book,
        notes
    });

    return { book, notes };
}
// =========================
// CREATE NEW BOOK
// =========================
export async function addBook(bookData, { file, cover }) {
    let fileUrl = null;
    let coverUrl = null;

    if (file) {
        fileUrl = await uploadFile("books", file);
    }

    if (cover) {
        coverUrl = await uploadFile("covers", cover);
    }

    const rawBook = await insertBook({
        title: bookData.title,
        author: bookData.author,
        file_url: fileUrl,
        cover_image_url: coverUrl,
        shelf_id: bookData.shelf_id,
        file_type: bookData.file_type,
        progress_percentage: 0
    });

    const book = normalizeBook(rawBook);

    Events.emit("book:created", book);

    return book;
}
// =========================
// PROGRESS UPDATE
// =========================
export async function saveReadingProgress(bookId, cfi, percentage) {
    await updateBookProgress(bookId, cfi, percentage);

    Events.emit("book:progress", {
        bookId,
        cfi,
        percentage
    });
}
// =========================
// TBR (TO BE READ)
// =========================
export async function toggleTBR(bookId, value = true) {
    await markBookAsTBR(bookId, value);

    Events.emit("book:tbr", {
        bookId,
        value
    });
}
// =========================
// NOTES
// =========================
export async function addNoteToBook(bookId, content, cfi = null) {
    const raw = await createNote({
        bookId,
        content,
        cfi
    });

    const note = normalizeNote(raw);

    State.addNote(bookId, note);

    Events.emit("note:created", {
        bookId,
        note
    });

    return note;
}
