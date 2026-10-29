export type RackDeviceState = 'active' | 'repair' | 'off' | 'network';

export interface RackDevice {
    id: number;
    name: string;
    subtitle?: string;
    /** پایین‌ترین یونیت اشغال‌شده (۱ = ته رک) */
    from: number;
    /** بالاترین یونیت اشغال‌شده */
    to: number;
    state: RackDeviceState;
    /** نام شاسی Blade. Bladeهای یک شاسی با بازه‌ی همپوشان داخل یک محفظه نشان داده می‌شوند. */
    chassis?: string;
    /** شماره‌ی Bay داخل شاسی */
    bay?: string;
}

export interface RackData {
    /** مثلاً C10 یا G7 */
    name: string;
    devices: RackDevice[];
}

/** تعداد یونیت همه‌ی رک‌ها */
export const RACK_UNITS = 42;

export const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/** رنگ دستگاه بر اساس وضعیت (سبز فقط برای فعال) */
export const DEVICE_STYLE: Record<RackDeviceState, { body: string; led: string }> = {
    active: {body: 'bg-linear-to-br from-success to-success/70', led: 'bg-white'},
    repair: {body: 'bg-linear-to-br from-warning to-warning/70', led: 'bg-white'},
    off: {body: 'bg-off/60', led: 'bg-danger'},
    network: {body: 'grad-slate', led: 'bg-white'},
};

/** دستگاه‌های داخل محدوده‌ی رک و درصد اشغال آن */
export function rackUsage(devices: RackDevice[], units = RACK_UNITS) {
    const valid = devices.filter((d) => d.from >= 1 && d.to <= units && d.from <= d.to);
    const used = new Set<number>();
    valid.forEach((d) => {
        for (let u = d.from; u <= d.to; u++) used.add(u);
    });
    return {valid, used, pct: Math.round((used.size / units) * 100)};
}

/** رنگ نشان و نوار درصد اشغال */
function usageStyle(pct: number) {
    if (pct >= 90) return {chip: 'bg-danger/20 text-danger', bar: 'bg-danger'};
    if (pct >= 75) return {chip: 'bg-warning/20 text-warning', bar: 'bg-warning'};
    if (pct === 0) return {chip: 'bg-white/5 text-muted', bar: 'bg-white/10'};
    return {chip: 'bg-accent-2/20 text-accent-2', bar: 'bg-accent-2'};
}

/** ارتفاع هر یونیت به پیکسل: رک ۴۲ یونیتی حدود ۱۰۹۲ پیکسل می‌شود و صفحه اسکرول عمودی دارد */
const UNIT_HEIGHT = 26;

/** یک بلوک نمایشی: یک دستگاه، یا چند Blade هم‌شاسی که بازه‌شان همپوشان است */
interface UnitBlock {
    from: number;
    to: number;
    chassis?: string;
    devices: RackDevice[];
}

const normName = (s?: string) => s?.trim().toLowerCase() || '';

/**
 * دستگاه‌ها را به بلوک تبدیل می‌کند.
 * فقط دستگاه‌هایی که شاسی یکسان و بازه‌ی همپوشان دارند با هم گروه می‌شوند.
 */
function buildBlocks(devices: RackDevice[]): UnitBlock[] {
    const sorted = [...devices].sort((a, b) => a.from - b.from || a.to - b.to);
    const blocks: UnitBlock[] = [];

    for (const d of sorted) {
        const key = normName(d.chassis);
        const block = key
            ? blocks.find((b) => normName(b.chassis) === key && d.from <= b.to && d.to >= b.from)
            : undefined;

        if (block) {
            block.devices.push(d);
            block.from = Math.min(block.from, d.from);
            block.to = Math.max(block.to, d.to);
        } else {
            blocks.push({from: d.from, to: d.to, chassis: d.chassis?.trim() || undefined, devices: [d]});
        }
    }
    return blocks;
}

/** شماره‌ی Bay را به ترتیب عددی مرتب می‌کند */
const bayOrder = (d: RackDevice) => Number(d.bay) || 0;

interface RackColumnProps {
    name: string;
    devices: RackDevice[];
    /** تعداد یونیت رک */
    units?: number;
    selectedId?: number | null;
    onSelect?: (id: number) => void;
}

/**
 * یک رک بزرگ: عنوان، درصد اشغال و یونیت‌ها از بالا (۴۲) تا پایین (۱).
 * رک بدون دستگاه به‌صورت قاب خالی نشان داده می‌شود.
 * جای هر دستگاه فقط از from و to می‌آید، پس دستگاه جدید خودش سر جای درست می‌نشیند.
 * Bladeهای یک شاسی داخل یک محفظه با کاشی Bay نشان داده می‌شوند.
 */
export function RackColumn({name, devices, units = RACK_UNITS, selectedId = null, onSelect}: RackColumnProps) {
    const {valid, used, pct} = rackUsage(devices, units);
    const usage = usageStyle(pct);
    const blocks = buildBlocks(valid);

    // ردیف گرید برای یک یونیت (یونیت بالا = ردیف ۱)
    const rowOf = (unit: number) => units - unit + 1;
    const allUnits = Array.from({length: units}, (_, i) => units - i);

    const renderSingle = (d: RackDevice) => {
        const selected = d.id === selectedId;
        const style = DEVICE_STYLE[d.state];
        const height = d.to - d.from + 1;
        const unitLabel = d.from === d.to ? `U${d.from}` : `U${d.from}-${d.to}`;
        return (
            <div
                key={d.id}
                style={{gridRow: `${rowOf(d.to)} / span ${height}`, gridColumn: 2}}
                className={`relative my-px ${selected ? 'z-10' : ''}`}
            >
                {selected && <div className="absolute -inset-1 rounded-xl bg-accent/40"/>}
                <button
                    type="button"
                    aria-pressed={selected}
                    title={`${d.name} · ${name} · ${unitLabel}`}
                    onClick={() => onSelect?.(d.id)}
                    className={`relative flex size-full items-center gap-3 overflow-hidden rounded-md px-3 text-start text-white transition hover:brightness-110 ${style.body} ${
                        selected ? 'ring-2 ring-white' : ''
                    }`}
                >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/10"/>
                    <span dir="ltr" className="relative min-w-0 flex-1 text-start">
                        <span className="block truncate text-sm font-bold leading-[18px]">{d.name}</span>
                        {height > 1 && d.subtitle && (
                            <span className="block truncate text-xs leading-4 opacity-85">{d.subtitle}</span>
                        )}
                    </span>
                    <span dir="ltr" className="relative text-[11px] font-bold opacity-80">
                        {unitLabel}
                    </span>
                    <span className={`relative size-2 shrink-0 rounded-full ${style.led}`}/>
                </button>
            </div>
        );
    };

    const renderEnclosure = (block: UnitBlock) => {
        const height = block.to - block.from + 1;
        const bays = [...block.devices].sort((a, b) => bayOrder(a) - bayOrder(b));
        const unitLabel = height === 1 ? `U${block.from}` : `U${block.from}-${block.to}`;
        return (
            <div
                key={`chassis-${bays.map((d) => d.id).join('-')}`}
                role="group"
                aria-label={`شاسی ${block.chassis ?? ''}`}
                style={{gridRow: `${rowOf(block.to)} / span ${height}`, gridColumn: 2}}
                className="my-px flex min-w-0 flex-col gap-0.5 overflow-hidden rounded-md border border-line bg-black/40 p-0.5"
            >
                {height >= 2 && (
                    <span dir="ltr" className="flex items-center justify-between px-1 text-[11px] font-bold text-muted">
                        <span className="truncate">{block.chassis}</span>
                        <span className="shrink-0">{unitLabel}</span>
                    </span>
                )}
                <div className="flex min-h-0 flex-1 gap-0.5">
                    {bays.map((d) => {
                        const selected = d.id === selectedId;
                        const style = DEVICE_STYLE[d.state];
                        const bayLabel = d.bay ? `Bay ${/^\d+$/.test(d.bay) ? toFa(Number(d.bay)) : d.bay}` : '';
                        return (
                            <button
                                key={d.id}
                                type="button"
                                aria-pressed={selected}
                                title={`${d.name} · ${block.chassis ?? ''} · ${bayLabel} · ${unitLabel}`}
                                onClick={() => onSelect?.(d.id)}
                                className={`relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded px-1.5 text-start text-white transition hover:brightness-110 ${style.body} ${
                                    selected ? 'ring-2 ring-white' : ''
                                }`}
                            >
                                {height >= 2 && bayLabel && (
                                    <span dir="ltr"
                                          className="truncate text-[10px] leading-3 opacity-85">{bayLabel}</span>
                                )}
                                <span dir="ltr" className="flex items-center gap-1 min-w-0">
                                    <span
                                        className="min-w-0 flex-1 truncate text-xs font-bold leading-4">{d.name}</span>
                                    <span className={`size-1.5 shrink-0 rounded-full ${style.led}`}/>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <section className="w-full max-w-[420px]" aria-label={`رک ${name}`}>
            <header className="mb-3 flex items-center gap-3">
                <h2 dir="ltr" className="text-2xl font-bold leading-none">
                    {name}
                </h2>
                <div className="flex flex-1 flex-col gap-1.5">
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${usage.chip}`}>
                        {toFa(used.size)} از {toFa(units)} یونیت · {toFa(pct)}٪
                    </span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className={`h-full rounded-full ${usage.bar}`} style={{width: `${pct}%`}}/>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border border-line bg-bg-1/85 p-3 shadow-lg shadow-black/20">
                <div className="mb-2 h-2 rounded-full bg-white/5"/>

                <div
                    className="grid grid-cols-[24px_1fr] gap-x-2"
                    style={{gridTemplateRows: `repeat(${units}, ${UNIT_HEIGHT}px)`}}
                >
                    {allUnits.map((u) => (
                        <span
                            key={`n${u}`}
                            dir="ltr"
                            style={{gridRow: rowOf(u), gridColumn: 1}}
                            className="flex items-center justify-center text-[11px] text-muted/70"
                        >
                            {u}
                        </span>
                    ))}

                    {allUnits
                        .filter((u) => !used.has(u))
                        .map((u) => (
                            <div
                                key={`e${u}`}
                                style={{gridRow: rowOf(u), gridColumn: 2}}
                                className="my-px rounded-md border border-dashed border-line bg-white/3"
                            />
                        ))}

                    {blocks.map((block) =>
                        block.devices.length > 1 ? renderEnclosure(block) : renderSingle(block.devices[0]),
                    )}
                </div>

                <div className="mt-2 h-2 rounded-full bg-white/5"/>
            </div>
        </section>
    );
}
