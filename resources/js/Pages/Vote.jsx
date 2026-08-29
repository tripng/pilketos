import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CandidateCard from '@/Components/CandidateCard';

export default function Vote({ studentName, candidates }) {
    const [selected, setSelected] = useState(null);
    const [justSelected, setJustSelected] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Flash error dari backend (mis. "Calon tidak valid")
    const pageErrors = usePage().props.errors || {};
    useEffect(() => {
        if (pageErrors.candidate) setError(pageErrors.candidate);
    }, [pageErrors]);

    // Trigger animasi meriah sesaat setelah memilih
    useEffect(() => {
        if (!selected) return;
        setJustSelected(true);
        const t = setTimeout(() => setJustSelected(false), 1200);
        return () => clearTimeout(t);
    }, [selected]);

    const handleSelect = (n) => {
        setError('');
        setSelected(n);
    };

    // Buka popup konfirmasi (sebelum benar-benar mengirim suara)
    const openConfirm = () => {
        if (!selected || sending) return;
        setShowConfirm(true);
    };

    const closeConfirm = () => setShowConfirm(false);

    const submitVote = () => {
        if (!selected || sending) return;
        const chosen = candidates.find((c) => c.number === selected);
        if (!chosen) return;

        setShowConfirm(false);
        setSending(true);
        setError('');

        // Kirim candidate_id sebagai body data (bukan VisitOptions).
        // router.post(url, data, options) → arg-2 adalah data request.
        router.post(
            '/pilih',
            { candidate_id: chosen.id },
            {
                preserveScroll: true,
                onError: (errs) => {
                    setError(errs.candidate || 'Gagal mengirim suara. Coba lagi.');
                    setSending(false);
                },
                onFinish: () => setSending(false),
            },
        );
    };

    const logout = () => {
        router.post('/voter/logout');
    };

    // Paslon terpilih untuk ditampilkan di popup konfirmasi
    const chosen = candidates.find((c) => c.number === selected) || null;

    return (
        <GuestLikeLayout>
            <Head title="Pemilihan" />

            {/* Header: judul kiri, tombol keluar kanan */}
            <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
                <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur transition hover:bg-rose-50 hover:text-rose-700 active:scale-95"
                >
                    <span aria-hidden>⎋</span>
                    Keluar
                </button>
            </div>

            <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
                        Pilketos 2026
                    </p>
                    <h1
                        className={
                            'mt-2 text-3xl font-extrabold text-emerald-800 sm:text-4xl transition-transform ' +
                            (justSelected ? 'animate-bounce-once' : '')
                        }
                    >
                        Pilih Pasangan Calon Anda
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-base text-emerald-700/80">
                        Terdapat {candidates.length} pasang calon. Pilih satu
                        yang menurut Anda paling tepat memimpin.
                    </p>
                    {studentName && (
                        <p className="mt-2 text-sm font-medium text-emerald-600">
                            Login sebagai: {studentName}
                        </p>
                    )}
                </div>

                {/* Pesan error (jika pengiriman gagal) */}
                {error && (
                    <div className="mx-auto mb-6 max-w-md rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-center text-sm font-medium text-rose-700">
                        {error}
                    </div>
                )}

                {/* Grid paslon */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((c) => (
                        <CandidateCard
                            key={c.id}
                            id={c.id}
                            number={c.number}
                            capres={c.capres.name}
                            capresPhoto={c.capres.photo}
                            capresPhotoHappy={c.capres.photoHappy}
                            cawapres={c.cawapres.name}
                            cawapresPhoto={c.cawapres.photo}
                            cawapresPhotoHappy={c.cawapres.photoHappy}
                            motto={c.motto}
                            color={c.color}
                            selected={selected === c.number}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>

                {/* Footer aksi */}
                <div className="mt-10 flex flex-col items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={openConfirm}
                        disabled={!selected || sending}
                        className={
                            'w-full max-w-xs rounded-xl px-6 py-3 text-base font-semibold text-white shadow-lg transition ' +
                            (selected && !sending
                                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-300/50'
                                : 'cursor-not-allowed bg-emerald-300/60')
                        }
                    >
                        {sending
                            ? 'Mengirim...'
                            : selected
                            ? `Konfirmasi Pilihan (Paslon ${selected})`
                            : 'Pilih salah satu calon'}
                    </button>
                </div>
            </div>

            {/* Popup konfirmasi sebelum mengirim suara */}
            {showConfirm && chosen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/40 px-4 backdrop-blur-sm"
                    onClick={closeConfirm}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header popup */}
                        <div className="bg-emerald-600 px-6 py-4 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
                                Konfirmasi Pilihan
                            </p>
                            <h2 className="mt-1 text-xl font-extrabold text-white">
                                Apakah Anda yakin?
                            </h2>
                        </div>

                        {/* Isi: foto + nama paslon terpilih */}
                        <div className="px-6 py-6">
                            <p className="mb-4 text-center text-sm text-emerald-700/80">
                                Anda akan memilih Paslon {chosen.number}
                            </p>

                            <div className="flex items-center justify-center gap-4">
                                {/* Capres */}
                                <div className="flex flex-col items-center">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50 shadow-inner">
                                        {chosen.capres.photo ? (
                                            <img
                                                src={chosen.capres.photo}
                                                alt={chosen.capres.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-semibold text-emerald-600">
                                                {chosen.capres.name
                                                    .split(' ')
                                                    .map((w) => w[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="mt-2 text-sm font-semibold text-gray-800">
                                        {chosen.capres.name}
                                    </span>
                                    <span className="text-xs text-gray-400">Calon 1</span>
                                </div>

                                <span className="pb-8 text-2xl font-light text-emerald-300">
                                    &amp;
                                </span>

                                {/* Cawapres */}
                                <div className="flex flex-col items-center">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50 shadow-inner">
                                        {chosen.cawapres.photo ? (
                                            <img
                                                src={chosen.cawapres.photo}
                                                alt={chosen.cawapres.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-semibold text-emerald-600">
                                                {chosen.cawapres.name
                                                    .split(' ')
                                                    .map((w) => w[0])
                                                    .slice(0, 2)
                                                    .join('')
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="mt-2 text-sm font-semibold text-gray-800">
                                        {chosen.cawapres.name}
                                    </span>
                                    <span className="text-xs text-gray-400">Calon 2</span>
                                </div>
                            </div>

                            {chosen.motto && (
                                <p className="mt-4 text-center text-sm italic text-gray-500">
                                    &ldquo;{chosen.motto}&rdquo;
                                </p>
                            )}
                        </div>

                        {/* Tombol aksi */}
                        <div className="flex gap-3 border-t border-emerald-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={submitVote}
                                disabled={sending}
                                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {sending ? 'Mengirim...' : 'Ya, Pilih'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLikeLayout>
    );
}

// Layout ringan lokal agar tidak bergantung GuestLayout bawaan Breeze
function GuestLikeLayout({ children }) {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100">
            <div className="flex min-h-screen flex-col items-center pt-10 sm:pt-0">
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
