import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import KemenagLogo from '@/Components/KemenagLogo';
import StatCard from '@/Components/admin/StatCard';
import VoteDonut from '@/Components/admin/VoteDonut';
import VoteBars from '@/Components/admin/VoteBars';
import KelasBars from '@/Components/admin/KelasBars';

export default function AdminDashboard({ stats, votes, kelas, live, access_token }) {
    const [voteData, setVoteData] = useState(votes);
    const [lastIncreased, setLastIncreased] = useState([]);
    const [pulse, setPulse] = useState(0);
    const prevVotes = useRef(votes);
    const hotTimeout = useRef(null);
    const adminName = usePage().props.auth?.admin?.username;

    const logout = () => {
        router.post('/admin/logout');
    };

    // Sinkronkan dengan props terbaru (mis. setelah polling)
    useEffect(() => {
        // Deteksi SELURUH paslon yang suaranya bertambah → array (keduanya animasi)
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

            // Auto-clear setelah ~2 detik agar efek tidak tertahan (fade out).
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

    // Polling live: ambil data terbaru dari DB tiap 3 detik
    useEffect(() => {
        if (!live) return;
        const t = setInterval(() => {
            router.reload({ only: ['stats', 'votes', 'kelas'] });
        }, 3000);
        return () => clearInterval(t);
    }, [live]);

    const totalVotes = voteData.reduce((s, d) => s + d.votes, 0);
    const SUDAH_MEMILIH = stats.sudah_memilih;
    const TOTAL_SISWA = stats.total_siswa;
    const BELUM_MEMILIH = stats.belum_memilih;
    const PARTISIPASI = stats.partisipasi;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100">
            <Head title="Dashboard Admin" />

            {/* Header */}
            <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <KemenagLogo showText={false} row />
                        <div>
                            <h1 className="text-lg font-extrabold text-emerald-800">
                                Dashboard Admin
                            </h1>
                            <p className="text-xs text-emerald-700/80">
                                IMUT &middot; Ingin Menentukan Pilihan Terbaik
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {adminName && (
                            <span className="hidden text-sm font-medium text-emerald-700/80 sm:inline">
                                {adminName}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={logout}
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
                        >
                            <span aria-hidden>⎋</span>
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            {/* Nav antar halaman admin */}
            <nav className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:px-6">
                <a
                    href="/admin"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
                >
                    Dashboard
                </a>
                <a
                    href="/admin/kelas"
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700/80 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
                >
                    Kelas
                </a>
                <a
                    href="/admin/peserta"
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700/80 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
                >
                    Peserta
                </a>
            </nav>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                {/* Token akses global untuk seluruh siswa */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-amber-900">
                                Token Akses Pemilih
                            </h2>
                            <p className="mt-1 text-sm text-amber-700/80">
                                Token ini wajib dimasukkan siswa saat login (selain NISN). Berlaku untuk seluruh siswa.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Reset token? Token lama tidak akan berlaku lagi.')) {
                                    router.post('/admin/token/reset');
                                }
                            }}
                            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
                        >
                            Reset Token
                        </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <code className="select-all rounded-lg bg-white px-4 py-2 font-mono text-lg tracking-widest text-amber-900 ring-1 ring-amber-200">
                            {access_token || '—'}
                        </code>
                        <a
                            href="/token"
                            className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                        >
                            Buka /token
                        </a>
                    </div>
                </div>
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        label="Total Siswa"
                        value={TOTAL_SISWA}
                        hint="Seluruh pemilih terdaftar"
                        accent="emerald"
                    />
                    <StatCard
                        label="Sudah Memilih"
                        value={SUDAH_MEMILIH}
                        hint="Telah menyalurkan suara"
                        accent="sky"
                    />
                    <StatCard
                        label="Belum Memilih"
                        value={BELUM_MEMILIH}
                        hint="Sisa suara masuk"
                        accent="amber"
                    />
                    <StatCard
                        label="Partisipasi"
                        value={`${PARTISIPASI}%`}
                        hint="Realisasi pemilih"
                        accent="rose"
                    />
                </div>

                {/* Grafik suara + per kelas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card
                        title="Suara 2 Paslon (Live)"
                        right={
                            <span className="text-xs font-medium text-emerald-600">
                                Donut
                            </span>
                        }
                        className="lg:col-span-1"
                    >
                        <VoteDonut data={voteData} />
                    </Card>

                    <Card
                        title="Perolehan per Paslon"
                        right={
                            <span
                                key={pulse}
                                className="animate-bounce-once text-xs font-medium text-emerald-600"
                            >
                                ● Live
                            </span>
                        }
                        className="lg:col-span-2"
                    >
                        <VoteBars data={voteData} lastIncreased={lastIncreased} />
                    </Card>
                </div>

                {/* Per kelas */}
                <Card title="Jumlah Siswa per Kelas">
                    <KelasBars data={kelas} />
                </Card>

                <p className="pb-6 text-center text-xs text-emerald-600/60">
                    * Data diambil langsung dari database &middot; diperbarui
                    otomatis setiap 3 detik.
                </p>
            </main>
        </div>
    );
}

function Card({ title, children, right, className = '' }) {
    return (
        <div
            className={
                'rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm ' +
                className
            }
        >
            <div className="mb-5 flex items-center justify-between border-b border-emerald-50 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                    {title}
                </h2>
                {right}
            </div>
            {children}
        </div>
    );
}
