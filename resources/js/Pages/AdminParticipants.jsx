import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import KemenagLogo from '@/Components/KemenagLogo';

export default function AdminParticipants({ participants, total, sudah_memilih, filters }) {
    const adminName = usePage().props.auth?.admin?.username;
    const [busyId, setBusyId] = useState(null);
    const [busyAll, setBusyAll] = useState(false);
    const [confirmAll, setConfirmAll] = useState(false);
    const [page, setPage] = useState(participants.current_page ?? 1);
    const [search, setSearch] = useState(filters.search ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'kelas');
    const [direction, setDirection] = useState(filters.direction ?? 'asc');

    const logout = () => router.post('/admin/logout');

    // Kirim perubahan filter/sort/pencarian ke server tanpa reload halaman.
    const updateQuery = (next) => {
        const params = {
            search,
            sort,
            direction,
            page: 1,
            ...next,
        };
        router.get('/admin/peserta', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['participants'],
        });
    };

    // Live search dengan debounce 350ms
    const onSearchChange = (val) => {
        setSearch(val);
        clearTimeout(onSearchChange._t);
        onSearchChange._t = setTimeout(() => updateQuery({ search: val }), 350);
    };

    const toggleSort = (column) => {
        if (sort === column) {
            const newDir = direction === 'asc' ? 'desc' : 'asc';
            setDirection(newDir);
            updateQuery({ sort: column, direction: newDir });
        } else {
            setSort(column);
            setDirection('asc');
            updateQuery({ sort: column, direction: 'asc' });
        }
    };

    const goToPage = (p) => {
        if (p < 1 || p > participants.last_page) return;
        setPage(p);
        router.get(
            '/admin/peserta',
            { search, sort, direction, page: p },
            { preserveState: true, preserveScroll: true, only: ['participants'] }
        );
    };

    const resetOne = (student) => {
        if (!confirm(`Reset suara ${student.name} (${student.nisn})?`)) return;
        setBusyId(student.id);
        router.post(
            `/admin/peserta/${student.id}/reset`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            }
        );
    };

    const resetAll = () => {
        setBusyAll(true);
        router.post(
            '/admin/peserta/reset-all',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setBusyAll(false);
                    setConfirmAll(false);
                },
            }
        );
    };

    const NavLink = ({ href, label, active }) => (
        <a
            href={href}
            className={
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition active:scale-95 ' +
                (active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-800')
            }
        >
            {label}
        </a>
    );

    const SortHeader = ({ label, column, sort, direction, onSort }) => {
        const activeSort = sort === column;
        return (
            <th className="px-4 py-3 font-bold">
                <button
                    type="button"
                    onClick={() => onSort(column)}
                    className={
                        'inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-emerald-600 ' +
                        (activeSort ? 'text-emerald-700' : '')
                    }
                >
                    {label}
                    <span className="text-[10px] leading-none">
                        {activeSort ? (direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                </button>
            </th>
        );
    };

    const rows = participants.data ?? [];
    const lastPage = participants.last_page ?? 1;
    const curPage = participants.current_page ?? 1;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-emerald-100">
            <Head title="Daftar Peserta" />

            <header className="border-b border-emerald-100 bg-white/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <KemenagLogo showText={false} row />
                        <div>
                            <h1 className="text-lg font-extrabold text-emerald-800">
                                Daftar Peserta
                            </h1>
                            <p className="text-xs text-emerald-700/80">
                                E-Voting &middot; Pilketos 2026
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

                {/* Nav antar halaman admin */}
                <nav className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:px-6">
                    <NavLink href="/admin" label="Dashboard" />
                    <NavLink href="/admin/kelas" label="Kelas" />
                    <NavLink href="/admin/peserta" label="Peserta" active />
                </nav>
            </header>

            <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
                {/* Ringkasan + aksi reset all + search */}
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-sm text-emerald-800">
                        Total peserta:{' '}
                        <span className="font-bold">{total}</span> &middot; Sudah
                        memilih:{' '}
                        <span className="font-bold text-emerald-600">
                            {sudah_memilih}
                        </span>{' '}
                        &middot; Belum memilih:{' '}
                        <span className="font-bold text-amber-600">
                            {total - sudah_memilih}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari NISN / Nama / Kelas…"
                            className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:w-64"
                        />
                        {!confirmAll ? (
                            <button
                                type="button"
                                onClick={() => setConfirmAll(true)}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-95"
                            >
                                Reset Semua Suara
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-rose-700">
                                    Yakin reset SELURUH suara?
                                </span>
                                <button
                                    type="button"
                                    onClick={resetAll}
                                    disabled={busyAll}
                                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                                >
                                    {busyAll ? 'Memproses…' : 'Ya, Reset All'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmAll(false)}
                                    className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                >
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabel peserta */}
                <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-sm">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-emerald-100 bg-emerald-50/60 text-xs uppercase tracking-wide text-emerald-800">
                            <tr>
                                <th className="px-4 py-3 font-bold">No</th>
                                <th className="px-4 py-3 font-bold">NISN</th>
                                <SortHeader
                                    label="Nama"
                                    column="name"
                                    sort={sort}
                                    direction={direction}
                                    onSort={toggleSort}
                                />
                                <SortHeader
                                    label="Kelas"
                                    column="kelas"
                                    sort={sort}
                                    direction={direction}
                                    onSort={toggleSort}
                                />
                                <SortHeader
                                    label="Status"
                                    column="status"
                                    sort={sort}
                                    direction={direction}
                                    onSort={toggleSort}
                                />
                                <th className="px-4 py-3 text-right font-bold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {rows.map((p, i) => (
                                <tr
                                    key={p.id}
                                    className="transition hover:bg-emerald-50/40"
                                >
                                    <td className="px-4 py-2.5 text-emerald-700/70">
                                        {(curPage - 1) * (participants.per_page ?? 50) + i + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-emerald-800">
                                        {p.nisn}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-emerald-900">
                                        {p.name}
                                    </td>
                                    <td className="px-4 py-2.5 text-emerald-700/80">
                                        {p.kelas}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {p.has_voted ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                ✓ Sudah memilih
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                                Belum memilih
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => resetOne(p)}
                                            disabled={!p.has_voted || busyId === p.id}
                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {busyId === p.id
                                                ? 'Memproses…'
                                                : 'Reset Vote'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {participants.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-emerald-600/60">
                            Belum ada peserta terdaftar.
                        </p>
                    )}
                </div>

                {/* Navigasi paginasi */}
                <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row">
                    <span className="text-emerald-700/80">
                        Halaman{' '}
                        <span className="font-bold text-emerald-800">{curPage}</span>{' '}
                        dari{' '}
                        <span className="font-bold text-emerald-800">{lastPage}</span>{' '}
                        &middot; Total {total} peserta
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => goToPage(curPage - 1)}
                            disabled={curPage <= 1}
                            className="rounded-lg border border-emerald-200 px-3 py-1.5 font-semibold text-emerald-700 transition hover:bg-emerald-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Sebelumnya
                        </button>
                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter(
                                (n) =>
                                    n === 1 ||
                                    n === lastPage ||
                                    Math.abs(n - curPage) <= 1
                            )
                            .map((n, idx, arr) => (
                                <span key={n} className="flex items-center">
                                    {idx > 0 && arr[idx - 1] !== n - 1 && (
                                        <span className="px-1 text-emerald-400">
                                            …
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => goToPage(n)}
                                        className={
                                            'min-w-[36px] rounded-lg px-2.5 py-1.5 font-semibold transition active:scale-95 ' +
                                            (n === curPage
                                                ? 'bg-emerald-600 text-white'
                                                : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50')
                                        }
                                    >
                                        {n}
                                    </button>
                                </span>
                            ))}
                        <button
                            type="button"
                            onClick={() => goToPage(curPage + 1)}
                            disabled={curPage >= lastPage}
                            className="rounded-lg border border-emerald-200 px-3 py-1.5 font-semibold text-emerald-700 transition hover:bg-emerald-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Berikutnya →
                        </button>
                    </div>
                </div>

                <p className="pb-6 text-center text-xs text-emerald-600/60">
                    * Tombol Reset Vote hanya aktif untuk peserta yang sudah
                    memilih.
                </p>
            </main>
        </div>
    );
}
