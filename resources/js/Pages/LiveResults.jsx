import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import KemenagLogo from '@/Components/KemenagLogo';
import VoteBars from '@/Components/admin/VoteBars';

export default function LiveResults({ votes, live }) {
    const [voteData, setVoteData] = useState(votes);
    const [lastIncreased, setLastIncreased] = useState([]);
    const [pulse, setPulse] = useState(0);
    const prevVotes = useRef(votes);
    const hotTimeout = useRef(null);

    // Sinkronkan dengan props terbaru (setelah polling) — deteksi SELURUH paslon
    // yang suaranya naik → masukkan ke array lastIncreased agar keduanya beranimasi
    // (lebih dramatis, bukan cuma 1 tertinggi). Setelah ~2 detik, animasi di-clear
    // otomatis (fade out kembali normal) — tidak menempel sampai reload berikutnya.
    useEffect(() => {
        const changed = [];
        votes.forEach((v, i) => {
            const before = prevVotes.current[i]?.votes ?? 0;
            if (v.votes > before) changed.push(v.number);
        });

        setVoteData(votes);
        prevVotes.current = votes;

        if (changed.length > 0) {
            setLastIncreased(changed);
            setPulse((p) => p + 1);

            // Auto-clear setelah durasi animasi (2s) agar efek tidak tertahan.
            if (hotTimeout.current) clearTimeout(hotTimeout.current);
            hotTimeout.current = setTimeout(() => {
                setLastIncreased([]);
            }, 2000);
        }
    }, [votes]);

    // Bersihkan timeout saat unmount.
    useEffect(() => {
        return () => {
            if (hotTimeout.current) clearTimeout(hotTimeout.current);
        };
    }, []);

    // Polling live: ambil data terbaru dari DB tiap 3 detik (only props).
    // router.reload hanya mengganti props -> component tidak di-remount,
    // sehingga animasi tetap stabil (tidak crack / tidak double).
    useEffect(() => {
        if (!live) return;
        const t = setInterval(() => {
            router.reload({ only: ['votes'] });
        }, 3000);
        return () => clearInterval(t);
    }, [live]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100">
            <Head title="Live Hasil IMUT" />

            {/* Header publik */}
            <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <KemenagLogo showText={false} row />
                        <div>
                            <h1 className="text-lg font-extrabold text-emerald-800">
                                Live Hasil
                            </h1>
                            <p className="text-xs text-emerald-700/80">
                                IMUT &middot; Ingin Menentukan Pilihan Terbaik
                            </p>
                        </div>
                    </div>
                    <span
                        key={pulse}
                        className="animate-bounce-once rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                    >
                        ● Live
                    </span>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                {/* Hanya perolehan per paslon */}
                <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between border-b border-emerald-50 pb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                            Perolehan per Paslon
                        </h2>
                        <span
                            key={pulse}
                            className="animate-bounce-once text-xs font-medium text-emerald-600"
                        >
                            ● Live
                        </span>
                    </div>
                    <VoteBars data={voteData} lastIncreased={lastIncreased} />
                </div>

                <p className="pb-6 text-center text-xs text-emerald-600/60">
                    * Data diambil langsung dari database &middot; diperbarui
                    otomatis setiap 3 detik.
                </p>
            </main>
        </div>
    );
}
