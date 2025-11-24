import Link from "next/link";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800">
          <h1 className="text-xl font-bold">ShortTree Admin</h1>
          <p className="text-xs text-slate-400">
            URL Shortener &amp; Bio Links
          </p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-md hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/shortlinks"
            className="block px-3 py-2 rounded-md hover:bg-slate-800"
          >
            Shortlinks
          </Link>
          <Link
            href="/admin/listlinks"
            className="block px-3 py-2 rounded-md hover:bg-slate-800"
          >
            Listlinks
          </Link>
        </nav>
      </aside>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}