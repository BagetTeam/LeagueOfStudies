"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/backend/utils/database";
import { useUser } from "@/lib/UserContext";
import { getFileByPath } from "@/backend/db/file";
import { Tables } from "@/backend/models/database.types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  Edit2,
  Save,
  X,
  Plus,
  Tag,
  MessageSquare,
  FileText,
} from "lucide-react";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export default function ViewFilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const prim = decodeURIComponent(params.file as string);

  const [file, setFile] = useState<Tables<"notes"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadFile = useCallback(async () => {
    if (!user?.user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const fileData = await getFileByPath(prim, user.user.id);
      if (!fileData) {
        setError("File not found");
        setLoading(false);
        return;
      }

      setFile(fileData);
      setEditedTitle(fileData.title);
      setEditedTags(fileData.tags || []);

      // Load comments from database
      if (fileData.comments && Array.isArray(fileData.comments)) {
        try {
          // Comments are stored as string[] in DB, parse each as JSON to get Comment objects
          const parsedComments = fileData.comments
            .map((commentStr) => {
              try {
                return JSON.parse(commentStr) as Comment;
              } catch {
                // Fallback: if it's not JSON, treat as plain text
                return {
                  id: crypto.randomUUID(),
                  text: commentStr,
                  createdAt: new Date().toISOString(),
                };
              }
            })
            .filter(Boolean);
          setComments(parsedComments);
        } catch (err) {
          console.error("Error parsing comments:", err);
          setComments([]);
        }
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error loading file:", err);
      setError("Failed to load file");
    } finally {
      setLoading(false);
    }
  }, [user?.user?.id, prim]);

  useEffect(() => {
    if (user?.user?.id && prim) {
      loadFile();
    }
  }, [user?.user?.id, prim, loadFile]);
  async function handleSaveTitle() {
    if (!file || !editedTitle.trim() || !user?.user?.id) return;

    try {
      const { data: updateData, error } = await supabase
        .from("notes")
        .update({ title: editedTitle.trim() })
        .eq("prim", file.prim)
        .eq("id", user.user.id)
        .select();

      if (error) {
        console.error("Error updating title:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        alert(`Failed to update title: ${error.message}`);
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.warn("Update succeeded but no data returned");
        // Fetch updated file
        const { data, error: fetchError } = await supabase
          .from("notes")
          .select("*")
          .eq("prim", file.prim)
          .eq("id", user.user.id)
          .single();

        if (fetchError || !data) {
          console.error("Error fetching updated file:", fetchError);
          alert("Failed to update title. Please try again.");
          return;
        }

        setFile(data);
        setIsEditingTitle(false);
        return;
      }

      setFile(updateData[0]);
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error updating title:", err);
      alert("Failed to update title");
    }
  }

  async function handleSaveTags() {
    if (!file || !user?.user?.id) return;

    try {
      const { data: updateData, error } = await supabase
        .from("notes")
        .update({ tags: editedTags.length > 0 ? editedTags : null })
        .eq("prim", file.prim)
        .eq("id", user.user.id)
        .select();

      if (error) {
        console.error("Error updating tags:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        alert(`Failed to update tags: ${error.message}`);
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.warn("Update succeeded but no data returned");
        // Fetch updated file
        const { data, error: fetchError } = await supabase
          .from("notes")
          .select("*")
          .eq("prim", file.prim)
          .eq("id", user.user.id)
          .single();

        if (fetchError || !data) {
          console.error("Error fetching updated file:", fetchError);
          alert("Failed to update tags. Please try again.");
          return;
        }

        setFile(data);
        setIsEditingTags(false);
        setNewTag("");
        return;
      }

      setFile(updateData[0]);
      setIsEditingTags(false);
      setNewTag("");
    } catch (err) {
      console.error("Error updating tags:", err);
      alert("Failed to update tags");
    }
  }

  function handleAddTag() {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setEditedTags(editedTags.filter((tag) => tag !== tagToRemove));
  }

  async function handleAddComment() {
    if (!newComment.trim() || !file) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment("");
    setIsAddingComment(false);

    // Save comments to database as string array
    try {
      if (!user?.user?.id) {
        setComments(comments);
        alert("User not authenticated");
        return;
      }
      const commentsAsStrings = updatedComments.map((c) => JSON.stringify(c));

      const { error } = await supabase
        .from("notes")
        .update({
          comments: commentsAsStrings.length > 0 ? commentsAsStrings : null,
        })
        .eq("prim", file.prim)
        .eq("id", user.user.id)
        .select();

      if (error) {
        console.error("Error saving comment:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // Revert on failure
        setComments(comments);
        alert(`Failed to save comment: ${error.message}`);
      }
    } catch (err) {
      console.error("Error saving comment:", err);
      // Revert on failure
      setComments(comments);
      alert("Failed to save comment");
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!file || !user?.user?.id) return;
    const updatedComments = comments.filter((c) => c.id !== commentId);
    setComments(updatedComments);

    // Save comments to database as string array
    try {
      const commentsAsStrings = updatedComments.map((c) => JSON.stringify(c));

      const { error } = await supabase
        .from("notes")
        .update({
          comments: commentsAsStrings.length > 0 ? commentsAsStrings : null,
        })
        .eq("prim", file.prim)
        .eq("id", user.user.id)
        .select();

      if (error) {
        console.error("Error deleting comment:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // Revert on failure
        setComments(comments);
        alert(`Failed to delete comment: ${error.message}`);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      // Revert on failure
      setComments(comments);
      alert("Failed to delete comment");
    }
  }

  async function handleDeleteFile() {
    if (
      !file ||
      !user?.user?.id ||
      !confirm(
        "Are you sure you want to delete this file? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete from storage first
      if (file.path) {
        const { error: storageError } = await supabase.storage
          .from("notes")
          .remove([file.path]);
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue with DB deletion even if storage fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("prim", file.prim)
        .eq("id", user.user.id);

      if (error) {
        console.error("Error deleting file from database:", error);
        alert("Failed to delete file");
        setIsDeleting(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file");
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading file...</div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "File not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-5 flex items-center gap-3 p-0 hover:cursor-pointer">
        <Link href="/dashboard">
          <Button
            className="flex cursor-pointer items-center gap-2 p-0 text-base"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        {/* File Info Card */}
        <Card>
          <CardHeader>
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    onClick={handleSaveTitle}
                    disabled={!editedTitle.trim()}
                    className="cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(file.title);
                    }}
                    className="cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <CardTitle className="text-2xl">{file.title}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingTitle(true)}
                    className="ml-2 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              Path: {file.path ? file.path.split("/")[1] || "N/A" : "N/A"}
              {file.subject && ` • Subject: ${file.subject}`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tags Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <CardTitle>Tags</CardTitle>
              </div>
              {!isEditingTags && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTags(true)}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingTags ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive ml-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddTag}
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTags} className="cursor-pointer">
                    Save Tags
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTags(false);
                      setEditedTags(file.tags || []);
                      setNewTag("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {file.tags && file.tags.length > 0 ? (
                  file.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/10 rounded-full px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No tags yet
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Comments</CardTitle>
              </div>
              {!isAddingComment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingComment(true)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isAddingComment ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="comment">New Comment</Label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 mt-2 min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px]"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="cursor-pointer"
                  >
                    Save Comment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAddingComment(false);
                      setNewComment("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="group bg-muted/50 relative rounded-lg border p-4"
                    >
                      <p className="pr-8 text-sm">{comment.text}</p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="hover:text-destructive absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                        title="Delete comment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      No comments yet. Add one to get started!
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete File Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Once you delete a file, there is no going back. Please be certain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteFile}
              disabled={isDeleting}
              className="w-full cursor-pointer sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete File"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
