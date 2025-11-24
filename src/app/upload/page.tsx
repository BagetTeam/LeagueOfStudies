"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/UserContext";
import PDF_reader from "../pdf_reader/reader";
import { supabase } from "@/backend/utils/database";
import { Input } from "@/ui";
export default function Upload() {
  const user = useUser();
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const firstRef = useRef(true);
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    console.log("im jorking it");
    if (!file) return;

    async function uploadFile() {
      try {
        const { data, error } = await supabase.storage
          .from("notes")
          .upload(`${file.name}_${Date.now()}`, file);

        if (error) {
          console.error("Upload error:", error);
        } else {
          console.log("Upload successful:", data);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    uploadFile();
  }, [file]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  const inputRef = useRef(null);
  const tabulate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {user.user && (
        <div className="flex min-h-screen flex-col items-center justify-start gap-4 p-4 md:p-8">
          <div className="w-full max-w-2xl space-y-6">
            <h1 className="text-theme-purple text-3xl font-bold">
              Upload Your Personalized Notes
            </h1>
            <div className="space-y-2">
              <label htmlFor="subject" className="mb-2 text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter subject (e.g., Mathematics, History)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyDown={tabulate}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="mb-2 text-sm font-medium">
                Tags
              </label>
              <Input
                id="tags"
                type="text"
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                ref={inputRef}
                onKeyDown={handleAddTag}
                className="w-full"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-theme-purple/10 text-theme-purple inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-theme-purple-dark focus:outline-none"
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <PDF_reader file={true} onExtract={setFile} />
            {file && (
              <div className="border-border bg-background rounded-lg border p-4">
                <p className="text-muted-foreground text-sm font-medium">
                  Selected file:
                </p>
                <p className="mt-1 text-base">{file?.name}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {!user.user && (
        <div className="mt-4 flex min-h-screen flex-col items-center justify-start gap-4 p-4 align-top">
          <p className="text-lg">Sign in to upload personal notes</p>
          <button className="bg-theme-purple hover:bg-theme-purple-dark flex w-auto items-center justify-center gap-2 rounded-lg px-6 py-2 font-semibold text-white transition-all">
            <Link href="/login" className="text-white">
              Sign in :)
            </Link>
          </button>
        </div>
      )}
    </>
  );
}
