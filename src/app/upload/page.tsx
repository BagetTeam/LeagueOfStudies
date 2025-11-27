"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useUser } from "@/lib/UserContext";
import PDF_reader from "../pdf_reader/reader";
import { Input, Button } from "@/ui";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/backend/utils/database";
import { useRouter } from "next/navigation";

export default function Upload() {
  const user = useUser();
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const router = useRouter();
  function handleNew() {
    setFile(null);
    setUploadSuccess(false);
    setTags([]);
    setSubject("");
    setSubjectError(false);
    setTitleError(false);
    setTitle("");
    setTagInput("");
    setUploading(false);
  }
  function handleUpload() {
    if (!file) return;

    // Validate before starting upload
    if (!subject.trim()) {
      setSubjectError(true);
      return;
    }
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    // Clear any previous errors
    setSubjectError(false);
    setTitleError(false);
    setUploading(true);

    async function uploadFile() {
      // Add timestamp to filename to avoid duplicates
      const timestamp = Date.now();
      const fileExtension = file?.name.split(".").pop();
      const fileNameWithoutExt = file?.name.replace(/\.[^/.]+$/, "");
      const uniqueFileName = `${fileNameWithoutExt}_${timestamp}.${fileExtension}`;
      const file_path = `${user.user?.id}/${uniqueFileName}`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("notes")
          .upload(file_path, file, {
            upsert: false, // Don't overwrite, create new file
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          console.error("Error details:", JSON.stringify(uploadError, null, 2));
          setUploading(false);
          router.push("/upload/error");
          return;
        }

        const noteId = user.user?.id;
        const email = user.user?.email;
        const key = crypto.randomUUID();

        if (!email) {
          console.error("User email is missing");
          router.push("/upload/error");
          return;
        }

        console.log("Inserting note with data:", {
          prim: key,
          id: noteId,
          title: title,
          email: email,
          path: file_path,
          subject: subject || null,
          tags: tags.length > 0 ? tags : null,
        });

        const { data, error } = await supabase
          .from("notes")
          .insert({
            prim: key,
            id: noteId,
            title: title,
            email: email,
            path: file_path,
            subject: subject || null,
            tags: tags.length > 0 ? tags : null,
          })
          .select();
        if (error) {
          console.error("Database insert error:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          router.push("/upload/error");
          setUploading(false);
          return;
        }
        // if (error) {
        //   console.error("Database insert error:", error);
        //   console.error("Error details:", JSON.stringify(error, null, 2));
        //   console.error("Error code:", error.code);
        //   console.error("Error message:", error.message);
        //   console.error("Error hint:", error.hint);
        // } else {
        //   console.log("Upload successful:", uploadData);
        //   console.log("Note inserted:", data);
        //   setUploadSuccess(true);
        // }

        setUploadSuccess(true);
        setSubjectError(false);
        setTitleError(false);
      } catch (err) {
        console.error("Upload failed:", err);
        router.push("/upload/error");
      } finally {
        setUploading(false);
      }
    }
    uploadFile();
  }

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
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {user.user && (
        <div className="flex min-h-screen flex-col items-center justify-start gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:p-8">
          <div className="w-full max-w-2xl space-y-4 sm:space-y-5 md:space-y-6">
            <div className="flex items-center gap-3 p-0">
              <Link href="/dashboard">
                <Button
                  className="flex items-center gap-2 p-0 text-base"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
            </div>
            <h1 className="text-theme-purple text-2xl font-bold sm:text-3xl md:text-4xl">
              Upload Your Personalized Notes
            </h1>
            {uploadSuccess && (
              <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 shadow-md">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold sm:text-base">
                      Upload Successful!
                    </p>
                    <p className="text-xs text-green-700 sm:text-sm">
                      Your file has been uploaded successfully.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleNew}
                  variant="special"
                  className="bg-theme-purple hover:bg-theme-purple-dark flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm"
                >
                  Upload a New File
                </Button>
              </div>
            )}
            <div className="">
              <label
                htmlFor="subject"
                className="mb-6 text-xs font-medium sm:text-sm"
              >
                Title
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter note's title (mandatory)"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError && e.target.value.trim()) {
                    setTitleError(false);
                  }
                }}
                onKeyDown={tabulate}
                className="w-full text-sm sm:text-base"
              />
              {titleError && (
                <span className="text-xs text-red-400">
                  Title needed for note
                </span>
              )}
            </div>

            <div className="">
              <label
                htmlFor="subject"
                className="mb-6 text-xs font-medium sm:text-sm"
              >
                Subject
              </label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter subject (mandatory)"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (subjectError && e.target.value.trim()) {
                    setSubjectError(false);
                  }
                }}
                onKeyDown={tabulate}
                className="w-full text-sm sm:text-base"
              />
              {subjectError && (
                <span className="text-xs text-red-400">
                  Subject or topic must be included
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="tags"
                className="mb-2 text-xs font-medium sm:text-sm"
              >
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
                className="w-full text-sm sm:text-base"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-theme-purple/10 text-theme-purple inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs sm:gap-1.5 sm:px-3 sm:py-1 sm:text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-theme-purple-dark text-base focus:outline-none sm:text-lg"
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
              <div className="border-border bg-background flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                    Selected file:
                  </p>
                  <p className="mt-1 truncate text-sm sm:text-base">
                    {file?.name}
                  </p>
                </div>
                <Button
                  onClick={handleUpload}
                  variant="special"
                  className="bg-theme-purple hover:bg-theme-purple-dark w-full font-semibold text-white sm:mr-2 sm:h-[50%] sm:w-auto sm:px-6"
                >
                  {uploading && "Uploading..."}
                  {!uploading && "Upload File"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {!user.user && (
        <div className="mt-4 flex min-h-screen flex-col items-center justify-start gap-3 p-4 align-top sm:gap-4 md:gap-6">
          <p className="text-center text-base sm:text-lg md:text-xl">
            Sign in to upload personal notes
          </p>
          <button className="bg-theme-purple hover:bg-theme-purple-dark flex w-full max-w-xs items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold text-white transition-all sm:w-auto sm:py-2">
            <Link href="/login" className="text-sm text-white sm:text-base">
              Sign in :)
            </Link>
          </button>
        </div>
      )}
    </>
  );
}
