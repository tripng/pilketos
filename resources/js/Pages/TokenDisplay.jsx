import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import KemenagLogo from '@/Components/KemenagLogo';

// Halaman publik /token — display token akses pemilih untuk ditampilkan
// di ruangan voting. Token auto-rotate tiap 1 menit; halaman ini auto-refresh
// & punya countdown waktu tersisa, jadi semua orang lihat token yang sama
// selama 1 menit lalu berubah bergemuruh.

export default function TokenDisplay({ access_token, token_rotated_at, live }) {
    const [token, setToken] = useState(access_token ?? '-');
    const [rotatedAt, setRotatedAt] = useState(token_rotated_at ?? null);
    // Countdown dihitung di klien dari token_rotated_at (ISO) + Date.now() — akurat,
    // tidak bergantung pada clock server yang bisa drift timezone.
    const [countdown, setCountdown] = useState(60);
    const countTick = useRef(null);

    // Hitung kembali detik-yang-tersisa sejak token diputar (0..60).
    const computeExpiry = (rotated) => {
        if (!rotated) return 60;
        const elapsed = (Date.now() - new Date(rotated).getTime()) / 1000;
        return Math.max(0, Math.floor(60 - elapsed));
    };

    // Sinkronkan keadaan dari props tiap polling selesai.
    const syncFromProps = (p) => {
        setToken(p.access_token ?? '-');
        setRotatedAt(p.token_rotated_at ?? null);
        setCountdown(computeExpiry(p.token_rotated_at));
    };

    // Hitung mundur tiap 1 detik — saat jalan ke 0, paksa reload token baru.
    useEffect(() => {
        if (countTick.current) clearInterval(countTick.current);
        countTick.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 0) return 0;
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(countTick.current);
    }, []);

    // Saat countdown jalan ke 0 → ambil token baru (rotate).
    useEffect(() => {
        if (countdown === 0 && rotatedAt) {
            router.reload({ only: ['access_token', 'token_rotated_at'] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown, rotatedAt]);

    // Polling lambat (10 detik) sebagai backstop & pendorong server-side rotate-on-request.
    useEffect(() => {
        if (!live) return;
        const t = setInterval(() => {
            router.reload({ only: ['access_token', 'token_rotated_at'] });
        }, 10000);
        return () => clearInterval(t);
    }, [live]);

    // Sync props ke state tiap polling selesai.
    useEffect(() => {
        syncFromProps({ access_token, token_rotated_at });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [access_token, token_rotated_at]);

    const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
    const secs = String(countdown % 60).padStart(2, '0');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-900 text-white">
            <Head title="Token Akses Pemilih — IMUT" />

            <div className="w-full max-w-xl space-y-8 px-4 text-center">
                <header className="space-y-3">
                    <div className="flex justify-center">
                        <KemenagLogo showText={false} row className="h-12 w-12 object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            IMUT 2026
                        </h1>
                        <p className="text-sm text-emerald-300">
                            Ingin Menentukan Pilihan Terbaik &middot; Token Akses Pemilih
                        </p>
                    </div>
                </header>

                <section className="space-y-6">
                    <div className="text-sm uppercase tracking-widest text-emerald-300">
                        TOKEN AKSES (berubah tiap 1 menit)
                    </div>

                    <div className="font-mono text-7xl font-extrabold tracking-[0.2em] text-white [text-shadow:_0_0_40px_rgb(16_185_122_/_0.4)]">
                        {token}
                    </div>

                    <div className="mx-auto flex max-w-xs items-center justify-center gap-2 text-sm text-emerald-200">
                        <span className="font-mono text-emerald-300">
                            {mins}:{secs}
                        </span>
                        <span className="opacity-50">·</span>
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${
                                countdown <= 10 ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
                            }`}
                        />
                        <span>berlaku sampai token berubah</span>
                    </div>

                    {rotatedAt && (
                        <p className="text-xs text-emerald-400/70">
                            Diputar terakhir:{' '}
                            {new Date(rotatedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                            })}
                        </p>
                    )}
                </section>

                <footer className="pt-8 text-xs text-emerald-400/60">
                    * Token ini sama untuk seluruh siswa — gunakan untuk login di halaman{' '}
                    <span className="underline">/pilih</span>. Token ganti otomatis tiap 1 menit.
                </footer>
            </div>
        </div>
    );
}
