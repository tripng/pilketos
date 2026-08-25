export default function KemenagLogo({ className = '', showText = true, row = false }) {
    return (
        <div
            className={
                'flex ' +
                (row ? 'flex-row items-center gap-3' : 'flex-col items-center ') +
                className
            }
        >
            <svg
                viewBox="0 0 120 120"
                className={row ? 'h-12 w-12' : 'h-20 w-20'}
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Logo Kementerian Agama"
            >
                {/* Lingkaran emas luar */}
                <circle
                    cx="60"
                    cy="60"
                    r="56"
                    fill="#ffffff"
                    stroke="#b45309"
                    strokeWidth="4"
                />
                <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="1.5"
                />

                {/* Bulan sabit */}
                <path
                    d="M70 34a22 22 0 1 0 0 44 18 18 0 1 1 0-44z"
                    fill="#047857"
                />
                {/* Bintang */}
                <path
                    d="M58 30l3.2 6.4 7 .9-5.1 4.9 1.3 7-6.4-3.3-6.4 3.3 1.3-7-5.1-4.9 7-.9z"
                    fill="#b45309"
                />

                {/* Kitab (buku) di bawah */}
                <g>
                    <path
                        d="M40 78c0-4 9-7 20-7s20 3 20 7v6c0 4-9 7-20 7s-20-3-20-7z"
                        fill="#047857"
                    />
                    <path
                        d="M60 71v13"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M48 74c4 2 8 3 12 3M72 74c-4 2-8 3-12 3"
                        stroke="#ffffff"
                        strokeWidth="1"
                        fill="none"
                    />
                </g>
            </svg>

            {showText && (
                <div className={row ? 'text-left' : 'mt-2 text-center'}>
                    <p className="text-[11px] font-semibold leading-tight tracking-wide text-emerald-800">
                        KEMENTERIAN AGAMA
                    </p>
                    <p className="text-[10px] leading-tight tracking-wide text-emerald-700/80">
                        REPUBLIK INDONESIA
                    </p>
                </div>
            )}
        </div>
    );
}
