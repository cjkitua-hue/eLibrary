// notespanel.js
// UI module responsible for displaying, creating, editing, and deleting notes
// associated with a book in the virtual library system.

export default class NotesPanel {
  constructor({ container, notesService, eventBus }) {
    this.container = container;
    this.notesService = notesService;
    this.eventBus = eventBus;

    this.state = {
      bookId: null,
      notes: [],
      activeNoteId: null,
      isEditing: false,
    };

    this.init();
  }

  init() {
    this.container.classList.add("notes-panel");

    this.container.innerHTML = `
      <div class="notes-header">
        <h3>Notes</h3>
        <button class="add-note-btn">+ New</button>
      </div>

      <div class="notes-body">
        <div class="notes-list"></div>

        <div class="notes-editor hidden">
          <input class="note-title" placeholder="Note title..." />
          <textarea class="note-content" placeholder="Write your note..."></textarea>

          <div class="notes-actions">
            <button class="save-note-btn">Save</button>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
    `;

    this.bindElements();
    this.attachEvents();
  }

  bindElements() {
    this.listEl = this.container.querySelector(".notes-list");
    this.editorEl = this.container.querySelector(".notes-editor");
    this.titleEl = this.container.querySelector(".note-title");
    this.contentEl = this.container.querySelector(".note-content");

    this.addBtn = this.container.querySelector(".add-note-btn");
    this.saveBtn = this.container.querySelector(".save-note-btn");
    this.deleteBtn = this.container.querySelector(".delete-note-btn");
  }

  attachEvents() {
    this.addBtn.addEventListener("click", () => this.createNewNote());
    this.saveBtn.addEventListener("click", () => this.saveNote());
    this.deleteBtn.addEventListener("click", () => this.deleteNote());

    this.titleEl.addEventListener("input", () => {
      this.state.isEditing = true;
    });

    this.contentEl.addEventListener("input", () => {
      this.state.isEditing = true;
    });
  }

  async loadNotes(bookId) {
    this.state.bookId = bookId;

    const notes = await this.notesService.getNotesByBook(bookId);
    this.state.notes = notes || [];

    this.renderList();
    this.clearEditor();
  }

  renderList() {
    this.listEl.innerHTML = "";

    if (!this.state.notes.length) {
      this.listEl.innerHTML = `<p class="empty">No notes yet</p>`;
      return;
    }

    this.state.notes.forEach(note => {
      const item = document.createElement("div");
      item.className = "note-item";
      item.dataset.id = note.id;

      item.innerHTML = `
        <div class="note-item-title">${note.title || "Untitled"}</div>
        <div class="note-item-preview">${(note.content || "").slice(0, 60)}</div>
      `;

      item.addEventListener("click", () => this.openNote(note.id));
      this.listEl.appendChild(item);
    });
  }

  openNote(noteId) {
    const note = this.state.notes.find(n => n.id === noteId);
    if (!note) return;

    this.state.activeNoteId = noteId;

    this.titleEl.value = note.title || "";
    this.contentEl.value = note.content || "";

    this.showEditor();
  }

  createNewNote() {
    this.state.activeNoteId = null;
    this.titleEl.value = "";
    this.contentEl.value = "";

    this.showEditor();
    this.titleEl.focus();
  }

  async saveNote() {
    if (!this.state.bookId) return;

    const payload = {
      id: this.state.activeNoteId,
      book_id: this.state.bookId,
      title: this.titleEl.value.trim(),
      content: this.contentEl.value.trim(),
      updated_at: new Date().toISOString(),
    };

    let saved;

    if (payload.id) {
      saved = await this.notesService.updateNote(payload);
      this.state.notes = this.state.notes.map(n =>
        n.id === payload.id ? saved : n
      );
    } else {
      saved = await this.notesService.createNote(payload);
      this.state.notes.push(saved);
    }

    this.state.activeNoteId = saved.id;
    this.state.isEditing = false;

    this.renderList();
    this.eventBus.emit("notes:updated", saved);
  }

  async deleteNote() {
    if (!this.state.activeNoteId) return;

    await this.notesService.deleteNote(this.state.activeNoteId);

    this.state.notes = this.state.notes.filter(
      n => n.id !== this.state.activeNoteId
    );

    this.state.activeNoteId = null;
    this.clearEditor();
    this.renderList();

    this.eventBus.emit("notes:deleted");
  }

  showEditor() {
    this.editorEl.classList.remove("hidden");
  }

  clearEditor() {
    this.titleEl.value = "";
    this.contentEl.value = "";
    this.editorEl.classList.add("hidden");
  }
}
