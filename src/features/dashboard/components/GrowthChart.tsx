import {useState} from 'react';

type RangeKey = '6' | '3' | '1';

interface RangeData {
    labels: string[]; // قدیمی → جدید
    total: number[];
    physical: number[];
}

/** داده‌های نمونه (placeholder) */
const RANGES: Record<RangeKey, RangeData> = {
    '6': {
        labels: ['خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان'],
        total: [170, 185, 196, 210, 226, 248],
        physical: [52, 55, 60, 63, 67, 70],
    },
    '3': {
        labels: ['شهریور', 'مهر', 'آبان'],
        total: [210, 226, 248],
        physical: [63, 67, 70],
    },
    '1': {
        labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴'],
        total: [236, 240, 244, 248],
        physical: [69, 69, 70, 70],
    },
};

const TABS: { key: RangeKey; label: string }[] = [
    {key: '6', label: '۶ ماه'},
    {key: '3', label: '۳ ماه'},
    {key: '1', label: '۱ ماه'},
];

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

// ابعاد داخلی SVG
const W = 600;
const H = 220;
const X_OLD = 560; // قدیمی‌ترین نقطه: سمت راست
const X_NEW = 72; // جدیدترین نقطه: سمت چپ
const Y_TOP = 40;
const Y_BASE = 180;

type Pt = [number, number];

const xOf = (i: number, n: number) => X_OLD - (i * (X_OLD - X_NEW)) / (n - 1);

/** منحنی نرم (Catmull-Rom) از نقاط مرتب‌شده بر اساس x */
function smoothPath(p: Pt[]): string {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] ?? p[i];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[i + 2] ?? p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
    }
    return d;
}

/** نقاط را از چپ (جدید) به راست (قدیمی) برمی‌گرداند */
function toPoints(values: number[], lo: number, hi: number): Pt[] {
    const n = values.length;
    return values
        .map((v, i) => [xOf(i, n), Y_BASE - ((v - lo) / (hi - lo)) * (Y_BASE - Y_TOP)] as Pt)
        .reverse();
}

/** نمودار رشد: دو خط (کل و فیزیکی)، تب بازه‌ی زمانی و نشانگر آخرین نقطه */
export function GrowthChart() {
    const [range, setRange] = useState<RangeKey>('6');
    const r = RANGES[range];
    const n = r.total.length;

    const all = [...r.total, ...r.physical];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = (max - min) * 0.15 || 1;
    const lo = min - pad;
    const hi = max + pad;

    const total = toPoints(r.total, lo, hi);
    const physical = toPoints(r.physical, lo, hi);
    const totalPath = smoothPath(total);
    const areaPath = `${totalPath} L${total[total.length - 1][0]} ${Y_BASE} L${total[0][0]} ${Y_BASE} Z`;

    // نشانگر روی جدیدترین نقطه (چپ‌ترین)
    const [mx, my] = total[0];
    const lastValue = r.total[n - 1];

    return (
        <div className="glass relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-line p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-[17px] font-bold">رشد منابع زیرساخت</h2>
                    <p className="mt-1 text-xs text-muted">تعداد سرورهای ثبت‌شده در بازه‌ی انتخابی</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent-2"/>
              کل سرورها
            </span>
                        <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-2"/>
              فیزیکی
            </span>
                    </div>
                </div>

                <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setRange(t.key)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                range === t.key ? 'grad-accent text-white' : 'text-muted hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <defs>
                    <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" style={{stopColor: 'var(--color-accent-2)', stopOpacity: 0.4}}/>
                        <stop offset="1" style={{stopColor: 'var(--color-accent)', stopOpacity: 0}}/>
                    </linearGradient>
                </defs>

                {/* خطوط راهنما */}
                {[60, 100, 140].map((y) => (
                    <line
                        key={y}
                        x1={X_NEW}
                        x2={X_OLD}
                        y1={y}
                        y2={y}
                        strokeDasharray="4 6"
                        className="stroke-white/10"
                    />
                ))}

                {/* ناحیه‌ی زیر خط کل */}
                <path d={areaPath} fill="url(#growth-area)"/>

                {/* خط فیزیکی (خط‌چین) */}
                <path
                    d={smoothPath(physical)}
                    fill="none"
                    strokeWidth={2.5}
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    className="stroke-slate-2"
                />

                {/* خط کل */}
                <path
                    d={totalPath}
                    fill="none"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    className="stroke-accent-2"
                />

                {/* نشانگر آخرین نقطه */}
                <line
                    x1={mx}
                    x2={mx}
                    y1={my}
                    y2={Y_BASE}
                    strokeDasharray="3 4"
                    className="stroke-white/30"
                />
                <circle cx={mx} cy={my} r={14} className="fill-accent-2/25"/>
                <circle cx={mx} cy={my} r={6} strokeWidth={3} className="fill-white stroke-accent-2"/>
                <rect x={mx - 48} y={my - 44} width={96} height={28} rx={10} className="fill-bg-1 stroke-accent-2/60"/>
                <text x={mx} y={my - 25} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-white">
                    {toFa(lastValue)} سرور
                </text>

                {/* برچسب ماه‌ها / هفته‌ها */}
                {r.labels.map((label, i) => (
                    <text
                        key={label}
                        x={xOf(i, n)}
                        y={205}
                        textAnchor="middle"
                        fontSize={12}
                        className="fill-muted"
                    >
                        {label}
                    </text>
                ))}
            </svg>
        </div>
    );
}
