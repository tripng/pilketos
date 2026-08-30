import { Head, Link } from '@inertiajs/react';
import KemenagLogo from '@/Components/KemenagLogo';

export default function VoteDone({ studentName }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100 px-4 py-10">
            <Head title="Terima Kasih" />

            <div className="mb-6 flex flex-col items-center">
                <KemenagLogo />
            </div>

            <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white px-8 py-10 text-center shadow-lg shadow-emerald-200/50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                    ✓
                </div>
                <h1 className="text-2xl font-extrabold text-emerald-800">
                    Suara Terekam
                </h1>
                <p className="mt-3 text-sm text-emerald-700/80">
                    Terima kasih
                    {studentName ? `, ${studentName}` : ''}. Suara Anda telah
                    tersimpan dan tidak dapat diubah.
                </p>
                <p className="mt-4 text-xs text-emerald-600/70">
                    Anda kini logout dari sesi pemilihan.
                </p>

                <Link
                    href="/"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-emerald-300/50 active:scale-95"
                >
                    Kembali ke Beranda
                </Link>
            </div>

            <p className="mt-6 text-center text-xs text-emerald-700/60">
                IMUT 2026 &middot; Ingin Menentukan Pilihan Terbaik
            </p>
        </div>
    );
}
