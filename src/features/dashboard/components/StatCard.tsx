import type {LucideIcon} from 'lucide-react';

type Tone = 'accent' | 'teal' | 'slate';

const tones: Record<Tone, { tile: string; line: string }> = {
    accent: {tile: 'grad-accent', line: 'stroke-accent-2'},
    teal: {tile: 'grad-teal', line: 'stroke-teal-2'},
    slate: {tile: 'grad-slate', line: 'stroke-slate-2'},
};

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    tone?: Tone;
    /** متن روند، مثلاً '▲ ۶٪' */
    trend?: string;
    /** داده‌های نمودار خطی کوچک؛ عدد بزرگ‌تر یعنی نقطه پایین‌تر روی نمودار */
    series?: number[];
}

/** مسیر SVG از روی لیست عدد می‌سازد (بدون کتابخانه‌ی نمودار) */
function buildPath(points: number[]): string {
    if (points.length < 2) return '';
    const min = Math.min(...points);
    const range = Math.max(...points) - min || 1;
    return points
        .map((v, i) => {
            const x = (i * 200) / (points.length - 1);
            const y = ((v - min) / range) * 40;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
}

/** کارت آمار داشبورد: آیکون و برچسب بالا، عدد بزرگ، نمودار کوچک پایین */
export function StatCard({label, value, icon: Icon, tone = 'accent', trend, series}: Props) {
    const t = tones[tone];

    return (
        <div
            className="glass relative flex min-h-[132px] flex-col gap-3 overflow-hidden rounded-3xl border border-line p-5">
            {/* هاله‌ی رنگی گوشه‌ی بالا (سمت راست، چون RTL است) */}
            <div className={`absolute -start-8 -top-8 size-24 rounded-full opacity-20 ${t.tile}`}/>

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`grid size-11 place-items-center rounded-2xl ${t.tile}`}>
                        <Icon size={22} strokeWidth={1.8}/>
                    </div>
                    <span className="text-sm text-muted">{label}</span>
                </div>
                {trend && (
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent-2">
            {trend}
          </span>
                )}
            </div>

            <div className="relative text-4xl font-bold">{value}</div>

            {series && (
                <svg
                    viewBox="0 0 200 40"
                    preserveAspectRatio="none"
                    className="relative mt-auto h-10 w-full overflow-visible"
                >
                    <path
                        d={buildPath(series)}
                        fill="none"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        className={t.line}
                    />
                </svg>
            )}
        </div>
    );
}
