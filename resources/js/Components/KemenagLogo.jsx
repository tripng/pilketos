export default function KemenagLogo({ className = '', showText = true, row = false }) {
    return (
        <div
            className={
                'flex ' +
                (row ? 'flex-row items-center gap-3' : 'flex-col items-center ') +
                className
            }
        >
            <img
                src="/img/logo.png"
                alt="Logo"
                className={row ? 'h-20 w-20 object-contain' : 'h-60 w-60 object-contain'}
            />

            {showText && (
                <div className={row ? 'text-left' : ' text-center'}>
                    <p className="text-[11px] font-semibold leading-tight tracking-wide text-emerald-800">
                        MAN 1 Kota Gorontalo
                    </p>
                    <p className="text-[10px] leading-tight tracking-wide text-emerald-700/80">
                        Provinsi Gorontalo
                    </p>
                </div>
            )}
        </div>
    );
}
