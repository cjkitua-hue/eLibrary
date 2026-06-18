// Initialize Supabase
const SUPABASE_URL = 'https://krpmolggusicvebbnuiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycG1vbGdndXNpY3ZlYmJudWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODcyNzMsImV4cCI6MjA5NzE2MzI3M30.sx9fFtpogsY06N1kgwfWuxvaOgYeDKkpyohJjKvNFU4';
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
// Fetch individual book details, including its notes
export async function fetchBookDetails(bookId) {
    const bookRequest = supabase.from('books').select('*').eq('id', bookId).single();
    const notesRequest = supabase.from('notes').select('*').eq('book_id', bookId).order('created_at', { ascending: false });

    const [bookRes, notesRes] = await Promise.all([bookRequest, notesRequest]);
    return { book: bookRes.data, notes: notesRes.data || [] };
}

// Update Bookmarking location using Epub.js CFI strings
export async function updateBookLocation(bookId, cfiStr, percentage) {
    await supabase
        .from('books')
        .update({ current_location_cfi: cfiStr, progress_percentage: percentage, last_read_at: new Date() })
        .eq('id', bookId);
}

// Insert a brand new Margin Note
export async function createMarginNote(bookId, content, chapterRef = "General") {
    const { data, error } = await supabase
        .from('notes')
        .insert([{ book_id: bookId, content, chapter_reference: chapterRef }])
        .select()
        .single();
    if (error) console.error("Error creating note:", error);
    return data;
}
// Fetch raw list of shelves for dropdown picker selection
export async function fetchAllShelves() {
    const { data, error } = await supabase.from('shelves').select('id, name');
    if (error) console.error("Error fetching shelves:", error);
    return data || [];
}

// Persist a brand new user book entry permanently
export async function insertNewBook(bookObj) {
    const { data, error } = await supabase
        .from('books')
        .insert([bookObj])
        .select();
    if (error) console.error("Error saving book:", error);
    return data;
}
// Generic function to upload a file to a specific Supabase bucket
export async function uploadLibraryFile(bucketName, file) {
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error(`Error uploading to ${bucketName}:`, error);
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

    return publicUrlData.publicUrl;
}
