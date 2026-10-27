const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const R = 72; // شعاع حلقه
const C = 2 * Math.PI * R; // محیط حلقه
const GAP = 4; // فاصله‌ی کوچک بین دو بخش

interface ServerMixChartProps {
    physical?: number;
    virtual?: number;
}

/** نمودار دایره‌ای: ترکیب سرورهای فیزیکی و مجازی (داده‌ی نمونه) */
export function ServerMixChart({physical = 70, virtual = 178}: ServerMixChartProps) {
    const total = physical + virtual || 1;
    const physLen = (C * physical) / total;
    const virtLen = (C * virtual) / total;
    const physPct = Math.round((physical * 100) / total);
    const virtPct = 100 - physPct;

    const items = [
        {label: 'مجازی', value: virtual, pct: virtPct, dot: 'bg-accent-2', pill: 'bg-accent-2/20 text-accent-2'},
        {label: 'فیزیکی', value: physical, pct: physPct, dot: 'bg-slate', pill: 'bg-slate/40 text-text-soft'},
    ];

    return (
        <div className="glass flex flex-col gap-5 rounded-3xl border border-line p-6">
            <div>
                <h2 className="text-[17px] font-bold">ترکیب سرورها</h2>
                <p className="mt-1 text-xs text-muted">فیزیکی در برابر مجازی</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative shrink-0">
                    <svg
                        viewBox="0 0 180 180"
                        className="size-44"
                        role="img"
                        aria-label={`فیزیکی ${toFa(physical)}، مجازی ${toFa(virtual)}`}
                    >
                        <g transform="rotate(-90 90 90)">
                            {/* مسیر خالی */}
                            <circle cx="90" cy="90" r={R} fill="none" strokeWidth={22} className="stroke-white/[0.07]"/>
                            {/* بخش مجازی */}
                            <circle
                                cx="90"
                                cy="90"
                                r={R}
                                fill="none"
                                strokeWidth={22}
                                strokeDasharray={`${virtLen - GAP} ${C}`}
                                strokeDashoffset={-(physLen + GAP / 2)}
                                className="stroke-accent-2"
                            />
                            {/* بخش فیزیکی */}
                            <circle
                                cx="90"
                                cy="90"
                                r={R}
                                fill="none"
                                strokeWidth={22}
                                strokeDasharray={`${physLen - GAP} ${C}`}
                                strokeDashoffset={-GAP / 2}
                                className="stroke-slate"
                            />
                        </g>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[32px] font-bold leading-none">{toFa(total)}</span>
                        <span className="mt-1 text-[11px] text-muted">کل سرورها</span>
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    {items.map((it) => (
                        <div key={it.label}
                             className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                                <span className={`size-2.5 rounded-full ${it.dot}`}/>
                                <span className="text-[13px] text-muted">{it.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">{toFa(it.value)}</span>
                                <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${it.pill}`}>
                  {toFa(it.pct)}٪
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
