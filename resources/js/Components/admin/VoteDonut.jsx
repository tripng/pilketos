// Donut chart suara 2 paslon (SVG murni, data statis)
export default function VoteDonut({ data }) {
    const total = data.reduce((s, d) => s + d.votes, 0) || 1;
    const size = 200;
    const r = 80;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;

    let offset = 0;
    const segments = data.map((d) => {
        const fraction = d.votes / total;
        const len = fraction * circ;
        const seg = {
            color: d.color,
            dash: len,
            gap: circ - len,
            rotate: (offset / circ) * 360,
        };
        offset += len;
        return seg;
    });

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${cx} ${cy})`}>
                    {segments.map((s, i) => (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="26"
                            strokeDasharray={`${s.dash} ${s.gap}`}
                            strokeDashoffset={-((s.rotate / 360) * circ)}
                        />
                    ))}
                </g>
                <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    className="fill-emerald-900 text-2xl font-extrabold"
                >
                    {total}
                </text>
                <text
                    x={cx}
                    y={cy + 16}
                    textAnchor="middle"
                    className="fill-emerald-700 text-[10px]"
                >
                    TOTAL SUARA
                </text>
            </svg>

            {/* Legenda */}
            <ul className="mt-4 w-full space-y-1">
                {data.map((d) => (
                    <li
                        key={d.number}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: d.color }}
                            />
                            Paslon {d.number}
                        </span>
                        <span className="font-semibold tabular-nums text-emerald-800">
                            {d.votes} (
                            {Math.round((d.votes / total) * 100)}%)
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
