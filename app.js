import { fetchLibraryHierarchy } from './api/supabase.js';
import { renderWings } from './ui/render.js';

document.addEventListener('DOMContentLoaded', async () => {
    const wingsContainer = document.getElementById('wings-container');
    const themeToggle = document.getElementById('theme-toggle');

    // 1. Load Data
    wingsContainer.innerHTML = '<p>Opening the vault...</p>';
    const libraryData = await fetchLibraryHierarchy();
    renderWings(libraryData, wingsContainer);

    // 2. The Midnight Archive Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'midnight') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'midnight');
        }
    });
});
