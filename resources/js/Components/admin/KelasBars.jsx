// Grid jumlah siswa per kelas (data statis)
export default function KelasBars({ data }) {
    const max = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => {
                const pct = (d.count / max) * 100;
                return (
                    <div key={d.kelas}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="font-medium text-emerald-900">
                                Kelas {d.kelas}
                            </span>
                            <span className="tabular-nums font-semibold text-emerald-700">
                                {d.count}
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
