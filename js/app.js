// app.js
// Composition root for Virtual Library
// Initializes services, event system, router, and core UI modules

import Router from "./router.js";
import Dashboard from "./dashboard.js";
import NotesPanel from "./notespanel.js";
import Bookshelf from "./bookshelf.js";
import Reader from "./reader.js";
// -------------------- Event Bus --------------------
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(handler);
  }

  emit(event, payload) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    handlers.forEach(h => h(payload));
  }

  off(event, handler) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    this.events.set(
      event,
      handlers.filter(h => h !== handler)
    );
  }
}
// -------------------- Services (abstractions) --------------------
// These assume you already have Supabase or another backend layer.
// Keep them thin and replace internals later as needed.
class LibraryService {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }

  async getWings() {
    const { data } = await this.db.from("wings").select("*");
    return data;
  }

  async getShelvesByWing(wingId) {
    const { data } = await this.db
      .from("shelves")
      .select("*")
      .eq("wing_id", wingId);

    return data;
  }

  async getBooksByShelf(shelfId) {
    const { data } = await this.db
      .from("books")
      .select("*")
      .eq("shelf_id", shelfId);

    return data;
  }
}

class NotesService {
  constructor(supabaseClient) {
    this.db = supabaseClient;
  }

  async getNotesByBook(bookId) {
    const { data } = await this.db
      .from("notes")
      .select("*")
      .eq("book_id", bookId);

    return data;
  }

  async createNote(note) {
    const { data } = await this.db
      .from("notes")
      .insert(note)
      .select()
      .single();

    return data;
  }

  async updateNote(note) {
    const { data } = await this.db
      .from("notes")
      .update(note)
      .eq("id", note.id)
      .select()
      .single();

    return data;
  }

  async deleteNote(noteId) {
    await this.db.from("notes").delete().eq("id", noteId);
  }
}
// -------------------- App Bootstrap --------------------
async function bootstrap() {
  const root = document.getElementById("app");

  // Supabase client assumed to be initialized globally or imported separately
  const supabase = window.supabaseClient;

  const eventBus = new EventBus();

  const libraryService = new LibraryService(supabase);
  const notesService = new NotesService(supabase);

  // Global Notes Panel (persistent side panel)
  const notesContainer = document.createElement("div");
  notesContainer.id = "notes-panel-root";
  document.body.appendChild(notesContainer);

  const notesPanel = new NotesPanel({
    container: notesContainer,
    notesService,
    eventBus
  });

  // Router manages main view
  const router = new Router({
    container: root,
    eventBus,
    views: {
      dashboard: Dashboard,
      reader: Reader,
      bookshelf: Bookshelf
    }
  });
  // -------------------- Global App Events --------------------
  eventBus.on("dashboard:open-book", (book) => {
    // Optional side effect: preload notes when opening book
    notesPanel.loadNotes(book.id);
  });

  eventBus.on("router:navigated", ({ view }) => {
    // Close notes panel when leaving reader if needed (optional policy)
    if (view !== "reader") {
      notesContainer.classList.add("hidden");
    } else {
      notesContainer.classList.remove("hidden");
    }
  });

  // Expose debug access (optional during development)
  window.app = {
    router,
    eventBus,
    libraryService,
    notesService
  };
}

bootstrap();
