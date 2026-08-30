import { Head, useForm } from '@inertiajs/react';
import KemenagLogo from '@/Components/KemenagLogo';

export default function VoterLogin() {
    const { data, setData, post, processing, errors } = useForm({
        nisn: '',
        token: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/voter/login', { preserveScroll: true });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100 px-4 py-10 sm:justify-center">
            <Head title="Masuk Pemilih" />

            {/* Header institusi */}
            <div className="mb-6 flex flex-col items-center">
                <KemenagLogo />
            </div>

            {/* Kartu login */}
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-100 bg-white px-8 py-8 shadow-lg shadow-emerald-200/50">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-extrabold text-emerald-800">
                        IMUT
                    </h1>
                    <p className="text-sm text-emerald-800">"Ingin Menentukan Pilihan Terbaik"</p>
                </div>

                <form onSubmit={submit}>
                    <div>
                        <label
                            htmlFor="nisn"
                            className="block text-sm font-medium text-emerald-800"
                        >
                            NISN
                        </label>
                        <input
                            id="nisn"
                            type="text"
                            inputMode="numeric"
                            maxLength={12}
                            value={data.nisn}
                            onChange={(e) =>
                                setData('nisn', e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="Masukkan NISN (8-12 digit)"
                            className="mt-1 block w-full rounded-xl border-emerald-200 bg-emerald-50/40 px-4 py-3 text-center text-lg tracking-widest text-emerald-900 shadow-sm outline-none ring-emerald-400 transition focus:border-emerald-400 focus:bg-white focus:ring-2"
                        />
                    </div>

                    {errors.nisn && (
                        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-center text-sm font-medium text-rose-600">
                            {errors.nisn}
                        </p>
                    )}

                    <div className="mt-4">
                        <label
                            htmlFor="token"
                            className="block text-sm font-medium text-emerald-800"
                        >
                            Token
                        </label>
                        <input
                            id="token"
                            type="text"
                            value={data.token}
                            onChange={(e) => setData('token', e.target.value)}
                            placeholder="Masukkan token akses"
                            className="mt-1 block w-full rounded-xl border-emerald-200 bg-emerald-50/40 px-4 py-3 text-center text-lg tracking-widest text-emerald-900 shadow-sm outline-none ring-emerald-400 transition focus:border-emerald-400 focus:bg-white focus:ring-2"
                        />
                    </div>

                    {errors.token && (
                        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-center text-sm font-medium text-rose-600">
                            {errors.token}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={processing || data.nisn.length === 0 || data.token.length === 0}
                        className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-emerald-300/50 disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-emerald-600/70">
                    Hanya kelas yang sudah dibuka &amp; belum memilih yang dapat
                    masuk.
                </p>
            </div>

            <p className="mt-6 text-center text-xs text-emerald-700/60">
                IMUT 2026 &middot; Ingin Menentukan Pilihan Terbaik
            </p>
        </div>
    );
}
