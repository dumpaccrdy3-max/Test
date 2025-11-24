import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">ShortTree Demo</h1>
        <p className="text-sm text-slate-600">
          Contoh web app yang menggabungkan fitur shortlink (ala Bitly) dan listlink
          (ala Linktree).
        </p>
        <div className="space-y-2">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
          >
            Masuk ke Admin
          </Link>
          <p className="text-xs text-slate-500">
            Contoh halaman publik:{" "}
            <Link
              href="/yourname"
              className="text-sky-600 hover:underline"
            >
              yourdomain.com/yourname
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}