// dashboard.js
// Main hub UI for the Virtual Library system
// Responsible for rendering Wings, Shelves, Books overview and routing user actions

export default class Dashboard {
  constructor({ container, libraryService, eventBus }) {
    this.container = container;
    this.libraryService = libraryService;
    this.eventBus = eventBus;

    this.state = {
      wings: [],
      activeWingId: null,
      activeShelfId: null,
      recentBooks: [],
      searchQuery: ""
    };

    this.init();
  }

  init() {
    this.container.classList.add("dashboard");

    this.container.innerHTML = `
      <div class="dashboard-header">
        <h2>Virtual Library</h2>
        <input class="search-input" placeholder="Search books, notes..." />
      </div>

      <div class="dashboard-body">
        <div class="wings-panel"></div>
        <div class="shelves-panel"></div>
        <div class="books-panel"></div>
      </div>

      <div class="dashboard-footer">
        <div class="recent-section">
          <h4>Recently Opened</h4>
          <div class="recent-list"></div>
        </div>
      </div>
    `;

    this.bindElements();
    this.attachEvents();
    this.loadInitialData();
  }

  bindElements() {
    this.searchInput = this.container.querySelector(".search-input");

    this.wingsPanel = this.container.querySelector(".wings-panel");
    this.shelvesPanel = this.container.querySelector(".shelves-panel");
    this.booksPanel = this.container.querySelector(".books-panel");

    this.recentList = this.container.querySelector(".recent-list");
  }

  attachEvents() {
    this.searchInput.addEventListener("input", (e) => {
      this.state.searchQuery = e.target.value;
      this.renderBooks(); // simple local filtering
    });

    this.eventBus.on("book:opened", (book) => {
      this.addToRecent(book);
    });
  }

  async loadInitialData() {
    const wings = await this.libraryService.getWings();
    this.state.wings = wings || [];

    this.renderWings();
  }
  /* ---------------- WINGS ---------------- */
  renderWings() {
    this.wingsPanel.innerHTML = "";

    this.state.wings.forEach((wing) => {
      const el = document.createElement("div");
      el.className = "wing-item";
      el.dataset.id = wing.id;
      el.textContent = wing.name;

      el.addEventListener("click", () => this.selectWing(wing.id));

      this.wingsPanel.appendChild(el);
    });
  }

  async selectWing(wingId) {
    this.state.activeWingId = wingId;

    const shelves = await this.libraryService.getShelvesByWing(wingId);
    this.state.shelves = shelves || [];

    this.renderShelves();
    this.booksPanel.innerHTML = "";
  }
  /* ---------------- SHELVES ---------------- */
  renderShelves() {
    this.shelvesPanel.innerHTML = "";

    this.state.shelves.forEach((shelf) => {
      const el = document.createElement("div");
      el.className = "shelf-item";
      el.dataset.id = shelf.id;
      el.textContent = shelf.name;

      el.addEventListener("click", () => this.selectShelf(shelf.id));

      this.shelvesPanel.appendChild(el);
    });
  }

  async selectShelf(shelfId) {
    this.state.activeShelfId = shelfId;

    const books = await this.libraryService.getBooksByShelf(shelfId);
    this.state.books = books || [];

    this.renderBooks();
  }
  /* ---------------- BOOKS ---------------- */
  renderBooks() {
    this.booksPanel.innerHTML = "";

    let books = this.state.books || [];

    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      books = books.filter(b =>
        (b.title || "").toLowerCase().includes(q)
      );
    }

    if (!books.length) {
      this.booksPanel.innerHTML = `<p class="empty">No books found</p>`;
      return;
    }

    books.forEach((book) => {
      const el = document.createElement("div");
      el.className = "book-card";
      el.dataset.id = book.id;

      el.innerHTML = `
        <div class="book-title">${book.title || "Untitled"}</div>
        <div class="book-meta">${book.author || ""}</div>
      `;

      el.addEventListener("click", () => this.openBook(book));

      this.booksPanel.appendChild(el);
    });
  }

  openBook(book) {
    this.eventBus.emit("dashboard:open-book", book);
  }
  /* ---------------- RECENT ---------------- */
  addToRecent(book) {
    this.state.recentBooks = [
      book,
      ...this.state.recentBooks.filter(b => b.id !== book.id)
    ].slice(0, 10);

    this.renderRecent();
  }

  renderRecent() {
    this.recentList.innerHTML = "";

    this.state.recentBooks.forEach((book) => {
      const el = document.createElement("div");
      el.className = "recent-item";
      el.textContent = book.title;

      el.addEventListener("click", () => this.openBook(book));

      this.recentList.appendChild(el);
    });
  }
}
