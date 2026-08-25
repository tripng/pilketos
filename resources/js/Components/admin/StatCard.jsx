export default function StatCard({ label, value, hint, accent = 'emerald' }) {
    const accents = {
        emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
        sky: 'text-sky-700 bg-sky-50 ring-sky-200',
        amber: 'text-amber-700 bg-amber-50 ring-amber-200',
        rose: 'text-rose-700 bg-rose-50 ring-rose-200',
    };
    return (
        <div
            className={
                'rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm ring-1 ' +
                accents[accent]
            }
        >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
        </div>
    );
}
