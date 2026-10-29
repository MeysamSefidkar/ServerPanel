import {useMemo, useState} from 'react';
import clsx from 'clsx';
import {PageHeader} from "../../shared/ui/PageHeader";
import {useAuditLog, type AuditAction} from './auditStore';

type Filter = 'all' | AuditAction;

const ACTION_LABEL: Record<AuditAction, string> = {
    create: 'ایجاد',
    update: 'ویرایش',
    delete: 'حذف',
};

const ACTION_CLASS: Record<AuditAction, string> = {
    create: 'bg-success/15 text-success',
    update: 'bg-accent/20 text-accent-2',
    delete: 'bg-danger/15 text-danger',
};

const FILTERS: { value: Filter; label: string }[] = [
    {value: 'all', label: 'همه'},
    {value: 'create', label: ACTION_LABEL.create},
    {value: 'update', label: ACTION_LABEL.update},
    {value: 'delete', label: ACTION_LABEL.delete},
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('fa-IR', {dateStyle: 'short', timeStyle: 'short'});
}

export default function AuditLogPage() {
    const entries = useAuditLog();
    const [filter, setFilter] = useState<Filter>('all');
    const [query, setQuery] = useState('');

    const rows = useMemo(() => {
        const q = query.trim();
        return entries.filter(
            (e) =>
                (filter === 'all' || e.action === filter) &&
                (q === '' || e.serverName.includes(q)),
        );
    }, [entries, filter, query]);

    return (
        <>
            <PageHeader
                title="تاریخچه تغییرات"
                subtitle={`${entries.length} رویداد ثبت شده`}
                actions={
                    <>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="جستجوی نام سرور…"
                            className="w-56 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-2"
                        />
                        <div className="flex gap-2">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => setFilter(f.value)}
                                    className={clsx(
                                        'rounded-xl px-3 py-1.5 text-sm transition-colors',
                                        filter === f.value
                                            ? 'grad-accent text-white'
                                            : 'bg-white/5 text-text-soft hover:bg-white/10',
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </>
                }
            />

            {rows.length === 0 ? (
                <div className="glass rounded-3xl border border-dashed border-line-strong p-16 text-center text-muted">
                    رویدادی برای نمایش نیست.
                </div>
            ) : (
                <div className="glass overflow-x-auto rounded-3xl border border-line">
                    <table className="w-full text-sm">
                        <thead className="text-muted">
                        <tr className="border-b border-line">
                            <th className="px-4 py-3 font-medium">زمان</th>
                            <th className="px-4 py-3 font-medium">کاربر</th>
                            <th className="px-4 py-3 font-medium">عملیات</th>
                            <th className="px-4 py-3 font-medium">سرور</th>
                            <th className="px-4 py-3 font-medium">تغییرات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((e) => (
                            <tr key={e.id} className="border-b border-line align-top last:border-0">
                                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.at)}</td>
                                <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                                    {e.actor}
                                </td>
                                <td className="px-4 py-3">
                    <span className={clsx('rounded-lg px-2 py-1 text-xs', ACTION_CLASS[e.action])}>
                      {ACTION_LABEL[e.action]}
                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">{e.serverName}</td>
                                <td className="px-4 py-3">
                                    {e.action === 'delete' || e.changes.length === 0 ? (
                                        <span className="text-muted">
                        {e.action === 'delete' ? 'کل سرور حذف شد' : 'بدون تغییر فیلد'}
                      </span>
                                    ) : (
                                        <ul className="space-y-1">
                                            {e.changes.map((c, i) => (
                                                <li key={i}>
                                                    <span className="text-muted">{c.field}: </span>
                                                    {c.before ? (
                                                        <>
                                                            از «{c.before}» به «{c.after || '—'}»
                                                        </>
                                                    ) : (
                                                        <>«{c.after || '—'}»</>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
