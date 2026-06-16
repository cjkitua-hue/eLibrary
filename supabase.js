// Initialize Supabase
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchLibraryHierarchy() {
    // Fetch Wings, nested with Shelves, nested with Books
    const { data, error } = await supabase
        .from('wings')
        .select(`
            id, name,
            shelves (
                id, name,
                books ( id, title, author, cover_image_url, progress_percentage )
            )
        `);
    
    if (error) {
        console.error("Error fetching library:", error);
        return [];
    }
    return data;
}

export async function addToTBR(bookId) {
    const { error } = await supabase
        .from('books')
        .update({ is_tbr: true })
        .eq('id', bookId);
    if (error) console.error("Error updating TBR status", error);
}
