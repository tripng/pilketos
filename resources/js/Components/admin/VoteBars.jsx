// Vertical bar chart perolehan 4 paslon dengan foto + animasi meriah saat naik
export default function VoteBars({ data, lastIncreased }) {
    const max = Math.max(...data.map((d) => d.votes), 1);

    return (
        <div className="space-y-4">
            {/* Grafik batang vertikal */}
            <div className="flex h-56 items-end justify-around gap-4 px-2">
                {data.map((d) => {
                    const pct = (d.votes / max) * 100;
                    const isHot = lastIncreased === d.number;
                    return (
                        <div
                            key={d.number}
                            className="relative flex h-full flex-1 flex-col items-center justify-end"
                        >
                            {/* Angka suara — meledak saat naik */}
                            <span
                                className={
                                    'mb-2 text-lg font-extrabold tabular-nums transition-all duration-300 ' +
                                    (isHot
                                        ? 'scale-150 text-amber-500 drop-shadow-[0_2px_5px_rgba(245,158,11,0.85)]'
                                        : 'scale-100 text-emerald-800')
                                }
                            >
                                {d.votes}
                            </span>

                            {/* Partikel confetti saat naik */}
                            {isHot && (
                                <div className="pointer-events-none absolute bottom-[58%] left-0 right-0 flex justify-center">
                                    {[
                                        'bg-amber-400',
                                        'bg-rose-400',
                                        'bg-sky-400',
                                        'bg-yellow-300',
                                        'bg-emerald-400',
                                    ].map((c, i) => (
                                        <span
                                            key={i}
                                            className={
                                                'absolute h-2 w-2 rotate-45 animate-spark ' +
                                                c
                                            }
                                            style={{
                                                left: `${15 + i * 18}%`,
                                                animationDelay: `${i * 0.07}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Bar vertikal */}
                            <div className="relative flex w-full max-w-[64px] flex-1 items-end">
                                {isHot && (
                                    <span className="absolute inset-0 -z-10 rounded-t-xl bg-amber-300/50 blur-md" />
                                )}
                                <div
                                    className={
                                        'w-full rounded-t-xl transition-[height] duration-700 ease-out ' +
                                        (isHot
                                            ? 'ring-4 ring-amber-400 shadow-[0_0_18px_4px_rgba(251,191,36,0.65)]'
                                            : '')
                                    }
                                    style={{
                                        height: `${pct}%`,
                                        backgroundColor: d.color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Foto paslon (satu foto per paslon) di bawah grafik masing-masing */}
            <div className="flex justify-around gap-4 px-2">
                {data.map((d) => {
                    const isHot = lastIncreased === d.number;
                    const src = isHot
                        ? d.capres.photoHappy || d.capres.photo
                        : d.capres.photo;
                    return (
                        <div
                            key={d.number}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {/* Frame persegi berisi 1 foto pasangan */}
                            <div
                                className={
                                    'h-24 w-24 overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-300 ' +
                                    (isHot
                                        ? 'scale-110 -rotate-2 border-amber-400 ring-2 ring-amber-300'
                                        : 'scale-100 border-emerald-200')
                                }
                            >
                                <img
                                    src={src}
                                    alt={`Paslon ${d.number}`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="mt-1.5 text-xs font-semibold text-emerald-900">
                                Paslon {d.number}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
