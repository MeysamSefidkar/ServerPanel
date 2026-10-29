import {useState, useEffect} from 'react';
import clsx from 'clsx';
import {Trash2} from 'lucide-react';
import {PageHeader} from "../../shared/ui/PageHeader";
import {
    LOOKUP_KINDS,
    addLookup,
    removeLookup,
    useLookupOptions,
    type LookupKind,
} from './lookupStore';
import {syncLookupsFromServers, useUsage} from './lookupUsage';

export default function LookupsPage() {
    const [kind, setKind] = useState<LookupKind>('group');
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const values = useLookupOptions(kind);
    const countUsage = useUsage();
    const current = LOOKUP_KINDS.find((k) => k.kind === kind)!;

    useEffect(() => {
        syncLookupsFromServers();
    }, []);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const err = addLookup(kind, draft);
        setError(err);
        setNotice(null);
        if (!err) setDraft('');
    }

    function remove(value: string) {
        const used = countUsage(kind, value);
        if (used > 0) {
            setNotice(`«${value}» در ${used.toLocaleString('fa-IR')} سرور استفاده شده و حذف نمی‌شود.`);
            return;
        }
        setNotice(null);
        removeLookup(kind, value);
    }

    return (
        <>
            <PageHeader
                title="مدیریت لیست‌ها"
                subtitle="مقادیر قابل انتخاب در فرم سرور"
                actions={
                    <div className="flex gap-2">
                        {LOOKUP_KINDS.map((k) => (
                            <button
                                key={k.kind}
                                type="button"
                                onClick={() => {
                                    setKind(k.kind);
                                    setError(null);
                                    setNotice(null);
                                    setDraft('');
                                }}
                                className={clsx(
                                    'rounded-xl px-3 py-1.5 text-sm transition-colors',
                                    kind === k.kind ? 'grad-accent text-white' : 'bg-white/5 text-text-soft hover:bg-white/10',
                                )}
                            >
                                {k.label}
                            </button>
                        ))}
                    </div>
                }
            />

            <form onSubmit={submit} className="mb-4 flex flex-wrap items-start gap-3">
                <div>
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`افزودن ${current.label} جدید…`}
                        className="w-72 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-2"
                    />
                    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
                </div>
                <button type="submit" className="grad-accent rounded-xl px-4 py-2 text-sm text-white">
                    افزودن
                </button>
            </form>

            {notice && (
                <p className="mb-4 rounded-xl bg-warning/15 px-3 py-2 text-sm text-warning">{notice}</p>
            )}

            {values.length === 0 ? (
                <div className="glass rounded-3xl border border-dashed border-line-strong p-16 text-center text-muted">
                    هنوز مقداری برای «{current.label}» ثبت نشده است.
                </div>
            ) : (
                <div className="glass overflow-x-auto rounded-3xl border border-line">
                    <table className="w-full text-sm">
                        <thead className="text-muted">
                        <tr className="border-b border-line">
                            <th className="px-4 py-3 text-right font-medium">{current.label}</th>
                            <th className="px-4 py-3 text-right font-medium">تعداد سرور</th>
                            <th className="w-16 px-4 py-3"/>
                        </tr>
                        </thead>
                        <tbody>
                        {values.map((v) => (
                            <tr key={v} className="border-b border-line last:border-0">
                                <td className="px-4 py-3">{v}</td>
                                <td className="px-4 py-3 text-muted">{countUsage(kind, v).toLocaleString('fa-IR')}</td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => remove(v)}
                                        aria-label={`حذف ${v}`}
                                        className="text-muted transition-colors hover:text-danger"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
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
