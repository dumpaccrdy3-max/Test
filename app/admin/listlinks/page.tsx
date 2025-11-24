"use client";

import { useState } from "react";

type ListLinkItem = {
  id: number;
  label: string;
  url: string;
  active: boolean;
};

type ThemeConfig = {
  bgType: "solid" | "gradient";
  primaryColor: string;
  secondaryColor: string;
  buttonShape: "rounded" | "pill";
};

type ProfileConfig = {
  avatarUrl: string;
  displayName: string;
  bio: string;
  slug: string;
};

export default function ListlinksPage() {
  const [profile, setProfile] = useState<ProfileConfig>({
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    displayName: "Your Name",
    bio: "Creator • Developer • Content",
    slug: "yourname"
  });

  const [theme, setTheme] = useState<ThemeConfig>({
    bgType: "gradient",
    primaryColor: "#0ea5e9",
    secondaryColor: "#6366f1",
    buttonShape: "pill"
  });

  const [links, setLinks] = useState<ListLinkItem[]>([
    { id: 1, label: "Website", url: "https://yourwebsite.com", active: true },
    {
      id: 2,
      label: "YouTube",
      url: "https://youtube.com/@yourchannel",
      active: true
    },
    {
      id: 3,
      label: "Instagram",
      url: "https://instagram.com/yourprofile",
      active: true
    }
  ]);

  const addLink = () => {
    setLinks(prev => [
      ...prev,
      {
        id: Date.now(),
        label: "New Link",
        url: "https://",
        active: true
      }
    ]);
  };

  const updateLink = (
    id: number,
    key: keyof ListLinkItem,
    value: string | boolean
  ) => {
    setLinks(prev =>
      prev.map(l => (l.id === id ? { ...l, [key]: value } : l))
    );
  };

  const removeLink = (id: number) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const backgroundStyle =
    theme.bgType === "gradient"
      ? {
          backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
        }
      : { backgroundColor: theme.primaryColor };

  const buttonClasses =
    theme.buttonShape === "pill" ? "rounded-full" : "rounded-lg";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Listlinks</h2>
          <p className="text-sm text-slate-500">
            Atur tampilan halaman link ala Linktree dan lihat preview secara
            realtime.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Konfigurasi Halaman
          </h3>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">
              Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Display Name
                </label>
                <input
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  value={profile.displayName}
                  onChange={e =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Slug / URL
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">
                    yourdomain.com/
                  </span>
                  <input
                    className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
                    value={profile.slug}
                    onChange={e =>
                      setProfile({ ...profile, slug: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bio
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                rows={2}
                value={profile.bio}
                onChange={e =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Avatar URL
              </label>
              <input
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                value={profile.avatarUrl}
                onChange={e =>
                  setProfile({ ...profile, avatarUrl: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase">
              Theme
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Background Type
                </label>
                <select
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  value={theme.bgType}
                  onChange={e =>
                    setTheme({
                      ...theme,
                      bgType: e.target.value as ThemeConfig["bgType"]
                    })
                  }
                >
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-9 border border-slate-200 rounded-md"
                    value={theme.primaryColor}
                    onChange={e =>
                      setTheme({ ...theme, primaryColor: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-9 border border-slate-200 rounded-md"
                    value={theme.secondaryColor}
                    onChange={e =>
                      setTheme({ ...theme, secondaryColor: e.target.value })
                    }
                    disabled={theme.bgType === "solid"}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bentuk Tombol
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border ${
                    theme.buttonShape === "rounded"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 text-slate-700"
                  }`}
                  onClick={() =>
                    setTheme({ ...theme, buttonShape: "rounded" })
                  }
                >
                  Rounded
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border ${
                    theme.buttonShape === "pill"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 text-slate-700"
                  }`}
                  onClick={() =>
                    setTheme({ ...theme, buttonShape: "pill" })
                  }
                >
                  Pill
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">
                Links
              </h4>
              <button
                type="button"
                onClick={addLink}
                className="text-xs text-sky-600 hover:text-sky-700"
              >
                + Tambah Link
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {links.map(link => (
                <div
                  key={link.id}
                  className="border border-slate-200 rounded-md p-2 flex flex-col gap-2"
                >
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-xs"
                      value={link.label}
                      onChange={e =>
                        updateLink(link.id, "label", e.target.value)
                      }
                      placeholder="Label"
                    />
                    <input
                      className="flex-[2] border border-slate-200 rounded-md px-2 py-1 text-xs"
                      value={link.url}
                      onChange={e =>
                        updateLink(link.id, "url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <label className="inline-flex items-center gap-1 text-slate-600">
                      <input
                        type="checkbox"
                        checked={link.active}
                        onChange={e =>
                          updateLink(link.id, "active", e.target.checked)
                        }
                      />
                      Aktif
                    </label>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => removeLink(link.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-xs text-slate-400">
                  Belum ada link. Klik "Tambah Link" untuk mulai.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div
            className="w-full max-w-xs rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden border border-slate-200"
            style={backgroundStyle}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-black/20 rounded-full" />

            <div className="mt-6 flex flex-col items-center text-center text-white">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 rounded-full border-2 border-white/80 object-cover shadow-md"
              />
              <h2 className="mt-3 text-lg font-semibold">
                {profile.displayName || "Nama Anda"}
              </h2>
              <p className="mt-1 text-xs text-white/80">{profile.bio}</p>
            </div>

            <div className="mt-4 space-y-2 pb-8">
              {links.filter(l => l.active).map(link => (
                <button
                  key={link.id}
                  className={`w-full ${buttonClasses} bg-white/90 text-slate-900 text-xs font-medium py-2.5 px-4 shadow-sm hover:bg-white transition flex items-center justify-center`}
                >
                  {link.label}
                </button>
              ))}
              {links.filter(l => l.active).length === 0 && (
                <p className="text-[11px] text-center text-white/80">
                  Belum ada link aktif.
                </p>
              )}
            </div>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="text-[10px] text-white/60">
                yourdomain.com/{profile.slug || "yourname"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}