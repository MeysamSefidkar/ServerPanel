import {useMemo, useState} from 'react';
import {Download, Plus} from 'lucide-react';
import {PageHeader} from "../../shared/ui/PageHeader.tsx";
import {ServerTable, type ServerRow} from './components/ServerTable';
import {ServerToolbar, type ServerCounts, type ServerFilter} from './components/ServerToolbar';
import {SERVERS} from './serverData';

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/** رک از روی محل سرور خوانده می‌شود (مثلاً «Rack C10 · U10-12» → C10). سرورهای مجازی رک ندارند. */
const rackOf = (row: ServerRow) => row.location.match(/Rack ([CG]\d{1,2})/)?.[1] ?? '';

// همان داده‌ی نمای رک. وقتی API بیاید، این مقادیر داخل کامپوننت محاسبه می‌شوند
const GROUPS = [...new Set(SERVERS.map((r) => r.group))].sort((a, b) => a.localeCompare(b, 'fa'));
const RACKS = [...new Set(SERVERS.map(rackOf).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'en', {numeric: true}),
);

const COUNTS: ServerCounts = {
    all: SERVERS.length,
    physical: SERVERS.filter((r) => r.type === 'physical').length,
    virtual: SERVERS.filter((r) => r.type === 'virtual').length,
};

/** صفحه لیست سرورها: هدر، نوار فیلتر و جدول */
export default function ServersPage() {
    const [filter, setFilter] = useState<ServerFilter>('all');
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('');
    const [rack, setRack] = useState('');

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        return SERVERS.filter((row) => {
            if (filter !== 'all' && row.type !== filter) return false;
            if (group && row.group !== group) return false;
            if (rack && rackOf(row) !== rack) return false;
            if (query) {
                const text = [row.name, row.ip, row.group, row.location].join(' ').toLowerCase();
                if (!text.includes(query)) return false;
            }
            return true;
        });
    }, [filter, search, group, rack]);

    return (
        <>
            <PageHeader
                title="لیست سرورها"
                subtitle={`${toFa(COUNTS.all)} سرور ثبت شده`}
                actions={
                    <>
                        <button
                            type="button"
                            className="glass flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm text-text-soft hover:border-line-strong"
                        >
                            <Download size={16}/>
                            خروجی Excel
                        </button>
                        <button
                            type="button"
                            className="grad-accent flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-white"
                        >
                            <Plus size={16}/>
                            سرور جدید
                        </button>
                    </>
                }
            />

            <ServerToolbar
                filter={filter}
                onFilterChange={setFilter}
                counts={COUNTS}
                search={search}
                onSearchChange={setSearch}
                groups={GROUPS}
                group={group}
                onGroupChange={setGroup}
                racks={RACKS}
                rack={rack}
                onRackChange={setRack}
            />

            {/* جدول در تبلت داخل خودش اسکرول می‌شود و کل صفحه تکان نمی‌خورد */}
            <div className="mt-6 min-w-0 overflow-x-auto rounded-3xl">
                <ServerTable rows={rows} total={COUNTS.all}/>
            </div>
        </>
    );
}
