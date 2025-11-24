"use client";

import { useState } from "react";

type Shortlink = {
  id: number;
  code: string;
  targetUrl: string;
  clicks: number;
  createdAt: string;
};

const initialShortlinks: Shortlink[] = [
  {
    id: 1,
    code: "yt",
    targetUrl: "https://youtube.com/@yourchannel",
    clicks: 123,
    createdAt: "2025-01-01"
  },
  {
    id: 2,
    code: "ig",
    targetUrl: "https://instagram.com/yourprofile",
    clicks: 45,
    createdAt: "2025-01-05"
  }
];

const BASE_URL = "https://yourdomain.com";

export default function ShortlinksPage() {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>(initialShortlinks);
  const [code, setCode] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const handleAdd = () => {
    if (!targetUrl) return;

    const newItem: Shortlink = {
      id: Date.now(),
      code: code || Math.random().toString(36).substring(2, 7),
      targetUrl,
      clicks: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setShortlinks(prev => [newItem, ...prev]);
    setCode("");
    setTargetUrl("");
  };

  const handleDelete = (id: number) => {
    setShortlinks(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Shortlinks</h2>
          <p className="text-sm text-slate-500">
            Kelola shortlink seperti Bitly untuk semua kebutuhan Anda.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Buat Shortlink Baru
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Short code (opsional)
              </label>
              <input
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="contoh: ig, yt, promo2025"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Target URL
              </label>
              <input
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="https://..."
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full inline-flex justify-center items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2.5 rounded-md"
            >
              Simpan Shortlink
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Daftar Shortlink
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-4">Short URL</th>
                  <th className="py-2 pr-4">Target URL</th>
                  <th className="py-2 pr-4">Klik</th>
                  <th className="py-2 pr-4">Dibuat</th>
                  <th className="py-2 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {shortlinks.map(item => (
                  <tr key={item.id} className="border-b last:border-none">
                    <td className="py-2 pr-4 font-mono text-xs text-slate-800">
                      {BASE_URL}/s/{item.code}
                    </td>
                    <td className="py-2 pr-4 max-w-xs truncate text-slate-700">
                      {item.targetUrl}
                    </td>
                    <td className="py-2 pr-4">{item.clicks}</td>
                    <td className="py-2 pr-4 text-xs text-slate-500">
                      {item.createdAt}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        className="text-xs text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {shortlinks.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-xs text-slate-400"
                    >
                      Belum ada shortlink.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}