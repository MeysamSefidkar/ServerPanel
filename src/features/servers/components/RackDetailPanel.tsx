import {History, Pencil, Server} from 'lucide-react';

export type RackServerStatus = 'active' | 'repair' | 'off';

export interface RackServerDetail {
    /** هم‌شناسه با RackDevice.id */
    id: number;
    name: string;
    status: RackServerStatus;
    /** مثلاً «فیزیکی» */
    kind: string;
    cpu: string;
    ram: string;
    disk: string;
    os: string;
    group: string;
    ip: string;
    location: string;
    /** ۰ تا ۱ */
    cpuUsage: number;
    /** ۰ تا ۱ */
    ramUsage: number;
}

/** داده‌ی نمونه، کلید = شناسه‌ی دستگاه در RackColumn. بعداً از API می‌آید. */
export const MOCK_DETAILS: Record<number, RackServerDetail> = {
    6: {
        id: 6,
        name: 'SRV-DB01',
        status: 'active',
        kind: 'فیزیکی',
        cpu: '32 Core · 2 × Xeon',
        ram: '128 GB',
        disk: '4 TB · RAID 10',
        os: 'Windows Server 2022',
        group: 'مالی',
        ip: '10.0.1.11',
        location: 'Rack A · U10-12',
        cpuUsage: 0.46,
        ramUsage: 0.8,
    },
    12: {
        id: 12,
        name: 'SRV-FS02',
        status: 'repair',
        kind: 'فیزیکی',
        cpu: '16 Core',
        ram: '64 GB',
        disk: '20 TB',
        os: 'Windows Server 2019',
        group: 'IT',
        ip: '10.0.1.22',
        location: 'Rack B · U14-15',
        cpuUsage: 0.12,
        ramUsage: 0.5,
    },
};

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const STATUS: Record<RackServerStatus, { label: string; text: string; bg: string; dot: string }> = {
    active: {label: 'فعال', text: 'text-success', bg: 'bg-success/15', dot: 'bg-success'},
    repair: {label: 'تعمیر', text: 'text-warning', bg: 'bg-warning/15', dot: 'bg-warning'},
    off: {label: 'خاموش', text: 'text-danger', bg: 'bg-danger/15', dot: 'bg-danger'},
};

/** رنگ نوار مصرف */
function barColor(value: number) {
    if (value >= 0.9) return 'bg-danger';
    if (value >= 0.75) return 'bg-warning';
    return 'bg-accent-2';
}

function UsageBar({label, value}: { label: string; value: number }) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span className="font-bold">{toFa(Math.round(value * 100))}٪</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${barColor(value)}`} style={{width: `${value * 100}%`}}/>
            </div>
        </div>
    );
}

interface RackDetailPanelProps {
    /** null = چیزی انتخاب نشده */
    server: RackServerDetail | null;
    /** فقط Admin می‌تواند ویرایش کند */
    canEdit?: boolean;
    onEdit?: (id: number) => void;
    onHistory?: (id: number) => void;
}

/** پنل جزئیات سرور انتخاب‌شده در نمای رک */
export function RackDetailPanel({server, canEdit = true, onEdit, onHistory}: RackDetailPanelProps) {
    const shell =
        'glass relative overflow-hidden rounded-3xl border border-line p-5';
    const glow =
        'pointer-events-none absolute -top-16 start-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(43_108_176/0.35),transparent_70%)]';

    if (!server) {
        return (
            <aside className={`${shell} flex min-h-64 flex-col items-center justify-center text-center`}>
                <div className={glow}/>
                <Server size={28} className="relative text-muted"/>
                <p className="relative mt-3 text-sm text-muted">برای دیدن جزئیات، یک دستگاه از رک را انتخاب کنید.</p>
            </aside>
        );
    }

    const st = STATUS[server.status];
    const rows: { label: string; value: string; latin: boolean }[] = [
        {label: 'CPU', value: server.cpu, latin: true},
        {label: 'RAM', value: server.ram, latin: true},
        {label: 'Disk', value: server.disk, latin: true},
        {label: 'سیستم‌عامل', value: server.os, latin: true},
        {label: 'گروه', value: server.group, latin: false},
        {label: 'IP', value: server.ip, latin: true},
        {label: 'محل', value: server.location, latin: true},
    ];

    return (
        <aside className={shell}>
            <div className={glow}/>

            <div className="relative">
                <div className="flex items-center gap-2 text-xs text-muted">
          <span className="grad-teal grid size-7 place-items-center rounded-lg text-white">
            <Server size={14}/>
          </span>
                    جزئیات سرور
                </div>

                <h2 dir="ltr" className="mt-4 text-start text-2xl font-bold">
                    {server.name}
                </h2>

                <span
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${st.bg} ${st.text}`}>
          <span className={`size-2 rounded-full ${st.dot}`}/>
                    {st.label} · {server.kind}
        </span>

                <dl className="mt-5">
                    {rows.map((r) => (
                        <div key={r.label} className="border-b border-line py-2.5 last:border-b-0">
                            <dt className="text-[11px] text-muted">{r.label}</dt>
                            <dd className={`mt-1 text-sm font-semibold ${r.latin ? 'dir-ltr text-start' : ''}`}>{r.value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="mt-4 space-y-4">
                    <UsageBar label="استفاده CPU" value={server.cpuUsage}/>
                    <UsageBar label="استفاده RAM" value={server.ramUsage}/>
                </div>

                <div className="mt-6 space-y-2">
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit?.(server.id)}
                            className="grad-accent flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white"
                        >
                            <Pencil size={15}/>
                            ویرایش سرور
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onHistory?.(server.id)}
                        className="glass flex h-9 w-full items-center justify-center gap-2 rounded-full border border-line text-xs text-text-soft hover:border-line-strong"
                    >
                        <History size={13}/>
                        تاریخچه تغییرات
                    </button>
                </div>
            </div>
        </aside>
    );
}
