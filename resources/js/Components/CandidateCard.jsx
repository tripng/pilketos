import { Link } from '@inertiajs/react';

export default function CandidateCard({
    number,
    capres,
    capresPhoto,
    capresPhotoHappy,
    cawapres,
    cawapresPhoto,
    cawapresPhotoHappy,
    motto,
    color = '#059669',
    selected = false,
    onSelect,
}) {
    const initials = (name) =>
        name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

    // Foto capres/cawapres (pakai happy kalau terpilih)
    const c1 = selected ? capresPhotoHappy || capresPhoto : capresPhoto;
    const c2 = selected ? cawapresPhotoHappy || cawapresPhoto : cawapresPhoto;

    return (
        <div
            className={
                'group relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 ' +
                (selected
                    ? 'scale-105 border-emerald-500 shadow-2xl shadow-emerald-300/60 ring-4 ring-emerald-400 animate-pop'
                    : 'border-gray-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg')
            }
        >
            {/* Confetti lokal saat terpilih */}
            {selected && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    {[
                        'left-2 top-3 bg-yellow-400',
                        'left-1/4 top-1 bg-pink-400',
                        'right-6 top-2 bg-emerald-400',
                        'right-2 top-6 bg-sky-400',
                        'left-10 bottom-3 bg-rose-400',
                        'right-10 bottom-2 bg-amber-400',
                    ].map((pos, i) => {
                        const dur = 1.1 + (i % 3) * 0.35;
                        const delay = i * 0.18;
                        return (
                            <span
                                key={i}
                                className={
                                    'absolute h-2.5 w-2.5 rotate-45 animate-confetti ' + pos
                                }
                                style={{
                                    animationDuration: `${dur}s`,
                                    animationDelay: `${delay}s`,
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Nomor urut */}
            <span
                className={
                    'absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold text-white shadow ' +
                    (selected
                        ? 'bg-emerald-600'
                        : 'bg-emerald-800 group-hover:bg-emerald-600')
                }
            >
                Paslon {number}
            </span>

            {/* Foto dua calon (persegi) */}
            <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                    <div
                        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-emerald-100 bg-emerald-50 shadow-inner"
                        style={{ borderColor: selected ? color : undefined }}
                    >
                        {c1 ? (
                            <img
                                src={c1}
                                alt={capres}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-semibold text-emerald-600">
                                {initials(capres)}
                            </span>
                        )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-500">
                        Calon 1
                    </span>
                </div>

                <span className="pb-6 text-2xl font-light text-emerald-300">
                    &amp;
                </span>

                <div className="flex flex-col items-center">
                    <div
                        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-emerald-100 bg-emerald-50 shadow-inner"
                        style={{ borderColor: selected ? color : undefined }}
                    >
                        {c2 ? (
                            <img
                                src={c2}
                                alt={cawapres}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-semibold text-emerald-600">
                                {initials(cawapres)}
                            </span>
                        )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-500">
                        Calon 2
                    </span>
                </div>
            </div>

            {/* Nama */}
            <div className="mt-4 text-center">
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                    {capres}
                </h3>
                <p className="text-sm text-gray-500">{cawapres}</p>
            </div>

            {/* Visi / moto */}
            <p className="mt-3 flex-1 text-center text-sm italic text-gray-600">
                &ldquo;{motto}&rdquo;
            </p>

            {/* Tombol pilih */}
            <button
                type="button"
                onClick={() => onSelect(number)}
                aria-pressed={selected}
                className={
                    'mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ' +
                    (selected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')
                }
            >
                {selected ? '✓ TERPILIH' : 'Pilih'}
            </button>
        </div>
    );
}
