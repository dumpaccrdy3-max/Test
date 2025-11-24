export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Ringkasan singkat aktivitas shortlink dan listlink Anda.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Total Shortlinks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Total Listlinks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">3</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Total Klik (dummy)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">1.234</p>
        </div>
      </section>
    </div>
  );
}