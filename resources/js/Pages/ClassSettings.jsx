import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KemenagLogo from '@/Components/KemenagLogo';

export default function ClassSettings({ classes: initialClasses }) {
    const [classes, setClasses] = useState(initialClasses);
    const [busyId, setBusyId] = useState(null);

    const toggle = (kelas) => {
        if (busyId === kelas.id) return;
        setBusyId(kelas.id);

        // Optimistic update: ubah UI langsung, revert kalau gagal
        const next = !kelas.is_open;
        setClasses((prev) =>
            prev.map((c) => (c.id === kelas.id ? { ...c, is_open: next } : c))
        );

        router.post(
            `/admin/kelas/${kelas.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onError: () => {
                    // rollback kalau request gagal
                    setClasses((prev) =>
                        prev.map((c) =>
                            c.id === kelas.id ? { ...c, is_open: kelas.is_open } : c
                        )
                    );
                },
                onFinish: () => setBusyId(null),
            }
        );
    };

    const openCount = classes.filter((c) => c.is_open).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
            <Head title="Pengaturan Kelas" />

            {/* Header */}
            <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
                    <KemenagLogo showText={false} row />
                    <div>
                        <h1 className="text-xl font-bold text-emerald-900">
                            Pengaturan Kelas
                        </h1>
                        <p className="text-sm text-emerald-600">
                            IMUT · Ingin Menentukan Pilihan Terbaik
                        </p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                        {openCount}/{classes.length} kelas aktif
                    </span>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Hanya kelas yang <strong>aktif</strong> yang diperbolehkan
                    login &amp; memilih. Nonaktifkan untuk menutup akses kelas
                    tersebut.
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {classes.map((kelas) => (
                        <div
                            key={kelas.id}
                            className={
                                'flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ' +
                                (kelas.is_open
                                    ? 'border-emerald-200 bg-white'
                                    : 'border-gray-200 bg-gray-50')
                            }
                        >
                            <div>
                                <p className="text-lg font-bold text-emerald-900">
                                    {kelas.code}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    {kelas.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {kelas.student_count} siswa
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span
                                    className={
                                        'rounded-full px-2 py-1 text-[11px] font-semibold ' +
                                        (kelas.is_open
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-200 text-gray-500')
                                    }
                                >
                                    {kelas.is_open ? 'BUKA' : 'TUTUP'}
                                </span>
                                <button
                                    onClick={() => toggle(kelas)}
                                    disabled={busyId === kelas.id}
                                    style={{
                                        backgroundColor: kelas.is_open
                                            ? '#e11d48'
                                            : '#059669',
                                    }}
                                    className={
                                        'mt-1 min-w-[100px] rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110 disabled:opacity-50'
                                    }
                                >
                                    {busyId === kelas.id
                                        ? '...'
                                        : kelas.is_open
                                        ? 'Tutup'
                                        : 'Buka'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
