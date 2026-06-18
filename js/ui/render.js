export function renderWings(wings, container) {
    container.innerHTML = ''; // Clear out the loading message

    if (!wings || wings.length === 0) {
        container.innerHTML = '<p class="empty-message">The vaults are currently empty. Open the intake panel to add a new book!</p>';
        return;
    }

    wings.forEach(wing => {
        const wingElement = document.createElement('section');
        wingElement.className = 'wing-section';
        wingElement.innerHTML = `
            <h2 class="wing-title">${wing.name}</h2>
            <p class="wing-desc">${wing.description || ''}</p>
            <div class="shelves-container"></div>
        `;

        const shelvesContainer = wingElement.querySelector('.shelves-container');

        if (wing.shelves && wing.shelves.length > 0) {
            wing.shelves.forEach(shelf => {
                const shelfElement = document.createElement('div');
                shelfElement.className = 'shelf-row';
                shelfElement.innerHTML = `
                    <h3 class="shelf-title">${shelf.name}</h3>
                    <div class="books-line"></div>
                `;

                const booksLine = shelfElement.querySelector('.books-line');

                if (shelf.books && shelf.books.length > 0) {
                    shelf.books.forEach(book => {
                        const bookElement = document.createElement('div');
                        bookElement.className = 'book-spine';
                        bookElement.dataset.id = book.id;
                        bookElement.innerHTML = `
                            <span class="book-title-text">${book.title}</span>
                            <span class="book-progress">${book.progress_percentage || 0}%</span>
                        `;
                        booksLine.appendChild(bookElement);
                    });
                } else {
                    booksLine.innerHTML = '<span class="empty-shelf">Empty Shelf</span>';
                }

                shelvesContainer.appendChild(shelfElement);
            });
        } else {
            shelvesContainer.innerHTML = '<p class="empty-wing">No shelves in this wing yet.</p>';
        }

        container.appendChild(wingElement);
    });
}
