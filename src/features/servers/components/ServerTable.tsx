import {useState} from 'react';
import {Cloud, HardDrive, MoreHorizontal, type LucideIcon} from 'lucide-react';

export type ServerType = 'physical' | 'virtual';
export type ServerStatus = 'active' | 'repair' | 'off';

export interface ServerRow {
    id: number;
    name: string;
    ip: string;
    type: ServerType;
    group: string;
    cpu: string;
    ram: string;
    /** درصد مصرف RAM از ۰ تا ۱ */
    ramUsage: number;
    disk: string;
    location: string;
    status: ServerStatus;
}

const TYPE_META: Record<ServerType, { label: string; icon: LucideIcon; tile: string; badge: string }> = {
    physical: {label: 'فیزیکی', icon: HardDrive, tile: 'grad-slate', badge: 'bg-slate/30 text-text-soft'},
    virtual: {label: 'مجازی', icon: Cloud, tile: 'grad-accent', badge: 'bg-accent-2/20 text-accent-2'},
};

const STATUS_META: Record<ServerStatus, { label: string; text: string; bg: string; dot: string }> = {
    active: {label: 'فعال', text: 'text-success', bg: 'bg-success/15', dot: 'bg-success'},
    repair: {label: 'تعمیر', text: 'text-warning', bg: 'bg-warning/15', dot: 'bg-warning'},
    off: {label: 'خاموش', text: 'text-danger', bg: 'bg-danger/15', dot: 'bg-danger'},
};

/*
 * ستون‌ها: اولین ستون سمت راست است (RTL).
 * زیر xl: ستون‌های «گروه» و «محل» پنهان می‌شوند و در زیر نام نشان داده می‌شوند.
 */
const ROW_GRID =
    'grid grid-cols-[minmax(0,1.6fr)_0.9fr_0.8fr_0.9fr_0.8fr_0.9fr_2rem] items-center gap-3 ' +
    'xl:grid-cols-[minmax(0,1.6fr)_0.9fr_0.9fr_0.8fr_1fr_0.8fr_1.3fr_0.9fr_2rem] xl:gap-4';

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

interface ServerTableProps {
    rows: ServerRow[];
    /** تعداد کل (برای متن پایین جدول) */
    total: number;
}

/** جدول لیست سرورها با انتخاب سطر */
export function ServerTable({rows, total}: ServerTableProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        // عرض حداقل روی خود کارت است؛ ظرف بیرونی در ServersPage اسکرول افقی را می‌دهد
        <div className="glass min-w-[720px] rounded-3xl border border-line p-4 xl:min-w-[992px]">
            <div className={`${ROW_GRID} rounded-2xl bg-white/5 px-3 py-3 text-xs font-bold text-muted xl:px-5`}>
                <span>نام سرور / IP</span>
                <span>نوع</span>
                <span className="hidden xl:block">گروه</span>
                <span>CPU</span>
                <span>RAM</span>
                <span>Disk</span>
                <span className="hidden xl:block">محل</span>
                <span>وضعیت</span>
                <span/>
            </div>

            <div className="mt-2 flex flex-col gap-1">
                {rows.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-muted">سروری با این فیلتر پیدا نشد</div>
                )}

                {rows.map((row) => {
                    const type = TYPE_META[row.type];
                    const status = STATUS_META[row.status];
                    const Icon = type.icon;
                    const selected = row.id === selectedId;

                    return (
                        <div
                            key={row.id}
                            role="row"
                            aria-selected={selected}
                            onClick={() => setSelectedId(row.id)}
                            className={`${ROW_GRID} cursor-pointer rounded-2xl border px-3 py-3 transition-colors xl:px-5 ${
                                selected ? 'border-accent/70 bg-accent/15' : 'border-transparent hover:bg-white/5'
                            }`}
                        >
                            {/* نام و IP (زیر xl همراه گروه و محل) */}
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${type.tile}`}>
                                    <Icon size={16} strokeWidth={1.8} className="text-white"/>
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-bold">{row.name}</div>
                                    <div className="dir-ltr truncate text-[11px] text-muted">{row.ip}</div>
                                    <div className="truncate text-[11px] text-muted xl:hidden">
                                        {row.group} · {row.location}
                                    </div>
                                </div>
                            </div>

                            {/* نوع */}
                            <span
                                className={`inline-flex w-fit rounded-xl px-2.5 py-1 text-xs font-bold ${type.badge}`}>
                                {type.label}
                            </span>

                            {/* گروه (فقط xl) */}
                            <span className="hidden truncate text-sm xl:block">{row.group}</span>

                            {/* CPU */}
                            <span className="dir-ltr truncate text-sm font-semibold">{row.cpu}</span>

                            {/* RAM + نوار مصرف */}
                            <div className="min-w-0">
                                <div className="dir-ltr truncate text-sm font-semibold">{row.ram}</div>
                                <div className="mt-1.5 h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className={`h-full rounded-full ${row.ramUsage > 0.85 ? 'bg-danger' : 'grad-accent'}`}
                                        style={{width: `${row.ramUsage * 100}%`}}
                                    />
                                </div>
                            </div>

                            {/* Disk */}
                            <span className="dir-ltr truncate text-sm font-semibold">{row.disk}</span>

                            {/* محل (فقط xl) */}
                            <span className="hidden truncate text-xs text-muted xl:block">{row.location}</span>

                            {/* وضعیت */}
                            <span
                                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.bg} ${status.text}`}
                            >
                                <span className={`size-1.5 rounded-full ${status.dot}`}/>
                                {status.label}
                            </span>

                            {/* منو */}
                            <button
                                type="button"
                                aria-label="عملیات"
                                onClick={(e) => e.stopPropagation()}
                                className="grid size-8 place-items-center rounded-xl bg-white/5 text-text-soft hover:bg-white/10"
                            >
                                <MoreHorizontal size={16}/>
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-line px-2 pt-4 text-sm text-muted">
                نمایش {toFa(rows.length)} از {toFa(total)} سرور
            </div>
        </div>
    );
}
