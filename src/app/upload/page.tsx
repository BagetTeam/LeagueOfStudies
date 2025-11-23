"use client";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";
import PDF_reader from "../pdf_reader/reader";
export default function Upload() {
  const user = useUser();

  return (
    <>
      {user.user && (
        <div className="flex min-h-screen flex-col items-center justify-start gap-4 p-4 md:p-8">
          <div className="w-full max-w-2xl">
            <PDF_reader onExtract={() => {}} />
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
