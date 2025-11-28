import { supabase } from "../utils/database";

export async function getNotes(id: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user stats:", error);
    return;
  }
  return data;
}

export async function getFileByPath(prim: string, userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("prim", prim)
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("Error fetching file by path:", error);
    return null;
  }
  return data;
}

// export async function updateFile(
//   prim: string,
//   updates: Partial<Pick<Tables<"notes">, "title" | "tags" | "subject" | "comments">>,
//   userId?: string,
// ) {
//   // Only allow updating specific fields
//   const allowedUpdates: Record<string, any> = {};
//
//   if (updates.title !== undefined) allowedUpdates.title = updates.title;
//   if (updates.tags !== undefined) allowedUpdates.tags = updates.tags;
//   if (updates.subject !== undefined) allowedUpdates.subject = updates.subject;
//   if (updates.comments !== undefined) allowedUpdates.comments = updates.comments;
//
//   // Don't update if no fields to update
//   if (Object.keys(allowedUpdates).length === 0) {
//     console.warn("No fields to update");
//     return null;
//   }
//
//   // First verify the file exists and belongs to the user
//   if (userId) {
//     const { data: existingFile, error: fetchError } = await supabase
//       .from("notes")
//       .select("prim, id")
//       .eq("prim", prim)
//       .eq("id", userId)
//       .maybeSingle();
//
//     if (fetchError) {
//       console.error("Error verifying file exists:", fetchError);
//       console.error("Fetch error details:", JSON.stringify(fetchError, null, 2));
//       return null;
//     }
//
//     if (!existingFile) {
//       console.warn("File not found or doesn't belong to user:", {
//         prim,
//         userId,
//         searchedFor: { prim, id: userId }
//       });
//       // Try to see if file exists at all
//       const { data: anyFile } = await supabase
//         .from("notes")
//         .select("prim, id")
//         .eq("prim", prim)
//         .maybeSingle();
//       console.log("File with this prim exists?", anyFile ? { prim: anyFile.prim, id: anyFile.id } : "No");
//       return null;
//     }
//
//     console.log("File verification passed:", { prim: existingFile.prim, id: existingFile.id });
//   }
//
//   let updateQuery = supabase
//     .from("notes")
//     .update(allowedUpdates)
//     .eq("prim", prim);
//
//   // Add user ID filter if provided for security
//   if (userId) {
//     updateQuery = updateQuery.eq("id", userId);
//   }
//
//   console.log("Executing update query with:", {
//     prim,
//     userId,
//     allowedUpdates,
//     queryFilters: { prim, ...(userId ? { id: userId } : {}) }
//   });
//
//   // Execute update without select first
//   const { error: updateError } = await updateQuery;
//
//   if (updateError) {
//     console.error("Error updating file:", updateError);
//     console.error("Error details:", JSON.stringify(updateError, null, 2));
//     console.error("Error code:", updateError.code);
//     console.error("Error message:", updateError.message);
//     console.error("Error hint:", updateError.hint);
//     console.error("Update payload:", allowedUpdates);
//     console.error("Prim:", prim, "UserId:", userId);
//     return null;
//   }
//
//   // Fetch the updated file
//   let fetchQuery = supabase
//     .from("notes")
//     .select("*")
//     .eq("prim", prim);
//
//   if (userId) {
//     fetchQuery = fetchQuery.eq("id", userId);
//   }
//
//   const { data, error: fetchError } = await fetchQuery.single();
//
//   if (fetchError) {
//     console.error("Error fetching updated file:", fetchError);
//     return null;
//   }
//
//   console.log("Update successful, returning data:", data);
//   return data;
// }
//
// export async function deleteFile(prim: string, path: string | null, userId?: string) {
//   // Delete from storage first
//   if (path) {
//     const { error: storageError } = await supabase.storage
//       .from("notes")
//       .remove([path]);
//     if (storageError) {
//       console.error("Error deleting file from storage:", storageError);
//       // Don't return false here - continue with DB deletion even if storage fails
//     }
//   }
//
//   // Delete from database
//   let query = supabase.from("notes").delete().eq("prim", prim);
//
//   // Add user ID filter if provided for security
//   if (userId) {
//     query = query.eq("id", userId);
//   }
//
//   // Select to check if any rows were actually deleted
//   const { error, data } = await query.select();
//   if (error) {
//     console.error("Error deleting file from database:", error);
//     console.error("Error details:", JSON.stringify(error, null, 2));
//     console.error("Error code:", error.code);
//     console.error("Error message:", error.message);
//     console.error("Prim:", prim, "UserId:", userId);
//     return false;
//   }
//
//   // Check if any rows were deleted
//   if (!data || data.length === 0) {
//     console.warn("No rows deleted for prim:", prim);
//     return false;
//   }
//
//   return true;
// }
