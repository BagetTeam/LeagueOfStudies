import Link from "next/link";
import { IoReloadOutline } from "react-icons/io5";

export default function ErrorPage() {
  return (
    <div className="mt-4 flex min-h-screen flex-col items-center justify-start gap-4 p-4 align-top">
      <p className="text-lg">Sorry, something went wrong :(</p>
      <button className="bg-theme-purple hover:bg-theme-purple-dark flex w-auto items-center justify-center gap-2 rounded-lg px-6 py-2 font-semibold text-white transition-all">
        <Link href="/upload" className="text-white">
          Retry Uploading a File{" "}
        </Link>
        <IoReloadOutline />
      </button>
    </div>
  );
}
