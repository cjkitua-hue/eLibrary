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
                        bookElement.className = 'book-card';
                        bookElement.dataset.id = book.id;

                        const coverStyle = book.cover_image_url 
                            ? `background-image: url('${book.cover_image_url}'); background-size: cover;`
                            : `background: linear-gradient(45deg, var(--accent-color), var(--shelf-bg));`;
                        
                        bookElement.innerHTML = `
                            <div class="book-cover" style="${coverStyle}">
                                ${!book.cover_image_url ? `<span class="fallback-title">${book.title}</span>` : ''}
                            </div>
                            <div class="book-meta">
                                <h4 class="book-title-text">${book.title}</h4>
                                <span class="book-author">${book.author}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${book.progress_percentage || 0}%"></div>
                                </div>
                            </div>
                        `;

                        booksLine.appendChild(bookElement);
                    });
                }

                shelvesContainer.appendChild(shelfElement);
            });
        }

        container.appendChild(wingElement);
    });
}
