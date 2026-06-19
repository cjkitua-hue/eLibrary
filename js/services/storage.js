// =========================
// SUPABASE STORAGE LAYER
// Raw data access only
// =========================
import { createClient } from "@supabase/supabase-js";
// =========================
// INIT CLIENT
// =========================
const SUPABASE_URL = "https://krpmolggusicvebbnuiw.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycG1vbGdndXNpY3ZpYmJudWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODcyNzMsImV4cCI6MjA5NzE2MzI3M30.sx9fFtpogsY06N1kgwfWuxvaOgYeDKkpyohJjKvNFU4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// =========================
// ERROR HANDLER (internal)
// =========================
function handleError(context, error) {
    console.error(`[Storage:${context}]`, error);
    return null;
}
// =========================
// LIBRARY STRUCTURE
// =========================
export async function getLibraryHierarchy() {
    const { data, error } = await supabase
        .from("wings")
        .select(`
            id,
            name,
            description,
            shelves (
                id,
                name,
                books (
                    id,
                    title,
                    author,
                    cover_image_url,
                    file_url,
                    file_type,
                    progress_percentage
                )
            )
        `);

    if (error) return handleError("getLibraryHierarchy", error);

    return data || [];
}
// =========================
// SHELVES
// =========================
export async function getShelves() {
    const { data, error } = await supabase
        .from("shelves")
        .select("id, name, wing_id");

    if (error) return handleError("getShelves", error);

    return data || [];
}
// =========================
// BOOKS
// =========================
export async function getBookDetails(bookId) {
    const bookReq = supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

    const notesReq = supabase
        .from("notes")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });

    const [bookRes, notesRes] = await Promise.all([bookReq, notesReq]);

    if (bookRes.error) return handleError("getBookDetails(book)", bookRes.error);
    if (notesRes.error) return handleError("getBookDetails(notes)", notesRes.error);

    return {
        book: bookRes.data,
        notes: notesRes.data || []
    };
}
// =========================
// BOOK WRITE OPERATIONS
// =========================
export async function insertBook(book) {
    const { data, error } = await supabase
        .from("books")
        .insert([book])
        .select()
        .single();

    if (error) return handleError("insertBook", error);

    return data;
}

export async function updateBookProgress(bookId, cfi, percentage) {
    const { error } = await supabase
        .from("books")
        .update({
            current_location_cfi: cfi,
            progress_percentage: percentage,
            last_read_at: new Date().toISOString()
        })
        .eq("id", bookId);

    if (error) return handleError("updateBookProgress", error);
    return true;
}

export async function markBookAsTBR(bookId, value = true) {
    const { error } = await supabase
        .from("books")
        .update({ is_tbr: value })
        .eq("id", bookId);

    if (error) return handleError("markBookAsTBR", error);
    return true;
}
// =========================
// NOTES
// =========================
export async function createNote({ bookId, content, chapterRef = "General", cfi = null }) {
    const { data, error } = await supabase
        .from("notes")
        .insert([
            {
                book_id: bookId,
                content,
                chapter_reference: chapterRef,
                cfi
            }
        ])
        .select()
        .single();

    if (error) return handleError("createNote", error);

    return data;
}
// =========================
// FILE UPLOADS
// =========================
export async function uploadFile(bucket, file) {
    const fileExt = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(uniqueName, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) return handleError("uploadFile", error);

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueName);

    return data.publicUrl;
}
