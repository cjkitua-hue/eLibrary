// acquisition.js
// Acquisition Chamber UI
// Responsible for introducing new books into the Virtual Library
export default class Acquisition {
  constructor({ container, eventBus, bookService, storageService }) {
    this.container = container;
    this.eventBus = eventBus;
    this.bookService = bookService;
    this.storageService = storageService;
    this.state = {
      wings: [],
      shelves: []
    };
    this.init();
  }
  init() {
    this.render();
    this.bindElements();
    this.attachEvents();
  }
  render() {
    this.container.innerHTML = `
      <section class="acquisition-chamber">
        <header class="chamber-header">
          <h2>
            Acquisition Chamber
          </h2>
          <p>
            Introduce a new volume into the archive
          </p>
        </header>
        <form class="acquisition-form">
          <input 
            class="book-title"
            type="text"
            placeholder="Volume title"
            required
          />
          <input
            class="book-author"
            type="text"
            placeholder="Author / Origin"
            required
          />
          <select class="shelf-selector" required>
            <option value="">
              Assign to Shelf
            </option>
          </select>
          <label>
            Manuscript File
            <input
              class="book-file"
              type="file"
              accept=".epub,.pdf"
              required
            />
          </label>
          <label>
            Cover Seal (optional)
            <input
              class="cover-file"
              type="file"
              accept="image/*"
            />
          </label>
          <button type="submit">
            Seal and Archive Volume
          </button>
        </form>
      </section>
    `;
  }
  bindElements() {
    this.form =
      this.container.querySelector(".acquisition-form");
    this.titleInput =
      this.container.querySelector(".book-title");
    this.authorInput =
      this.container.querySelector(".book-author");
    this.shelfSelect =
      this.container.querySelector(".shelf-selector");
    this.bookFile =
      this.container.querySelector(".book-file");
    this.coverFile =
      this.container.querySelector(".cover-file");
  }
  attachEvents() {
    this.form.addEventListener(
      "submit",
      (event)=>{
        event.preventDefault();
        this.acquireBook();
      }
    );
  }
  async loadShelves() {
    const shelves =
      await this.bookService.getAvailableShelves();
    this.state.shelves = shelves;
    this.populateShelves();

  }
  populateShelves() {
    this.shelfSelect.innerHTML = `

      <option value="">
        Assign to Shelf
      </option>
    `;
    this.state.shelves.forEach(
      shelf=>{
        const option =
          document.createElement("option");
        option.value = shelf.id;
        option.textContent =
          shelf.name;
        this.shelfSelect.appendChild(option);
      }
    );
  }
  async acquireBook() {
    try {
      const file =
        this.bookFile.files[0];
      const cover =
        this.coverFile.files[0];
      if(!file){
        throw new Error(
          "Please select a manuscript file"
        );
      }
      // 1. Upload manuscript
      const fileUrl =
        await this.storageService.uploadBook(file);
      // 2. Upload cover if available
      let coverUrl = null;
      if(cover){

        coverUrl =
          await this.storageService.uploadCover(cover);

      }
      // 3. Save metadata
      const book = {
        title:
          this.titleInput.value.trim(),
        author:
          this.authorInput.value.trim(),
        shelf_id:
          this.shelfSelect.value,
        file_url:
          fileUrl,
        cover_url:
          coverUrl,
        type:
          file.name
            .split(".")
            .pop()
            .toLowerCase()
      };
      const savedBook =
        await this.bookService.createBook(book);

      // 4. Notify application
      this.eventBus.emit(
        "book:added",
        savedBook
      );
      this.reset();
      alert(
        "Volume successfully archived"
      );
    } catch(error){
      console.error(
        "Acquisition failed:",
        error
      );
      alert(
        error.message
      );
    }
  }
  reset(){
    this.form.reset();

  }


}
