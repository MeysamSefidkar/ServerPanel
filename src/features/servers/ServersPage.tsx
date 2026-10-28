import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Download, Plus} from 'lucide-react';
import {PageHeader} from "../../shared/ui/PageHeader.tsx";
import {useCurrentUser} from "../../shared/auth/useCurrentUser.ts";
import {ServerTable, type ServerRow} from './components/ServerTable';
import {ServerToolbar, type ServerCounts, type ServerFilter} from './components/ServerToolbar';
import {useServers} from './serverStore';

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/** رک از روی محل سرور خوانده می‌شود (مثلاً «Rack C10 · U10-12» → C10). سرورهای مجازی رک ندارند. */
const rackOf = (row: ServerRow) => row.location.match(/Rack ([CG]\d{1,2})/)?.[1] ?? '';

/** صفحه لیست سرورها: هدر، نوار فیلتر و جدول. داده از serverStore می‌آید. */
export default function ServersPage() {
    const navigate = useNavigate();
    const {role} = useCurrentUser();
    const isAdmin = role === 'Admin';
    const servers = useServers();

    const [filter, setFilter] = useState<ServerFilter>('all');
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('');
    const [rack, setRack] = useState('');

    // گروه‌ها، رک‌ها و شمارش‌ها از همان داده‌ی فعلی ساخته می‌شوند تا با افزودن سرور جدید به‌روز شوند
    const groups = useMemo(
        () => [...new Set(servers.map((r) => r.group))].sort((a, b) => a.localeCompare(b, 'fa')),
        [servers],
    );

    const racks = useMemo(
        () =>
            [...new Set(servers.map(rackOf).filter(Boolean))].sort((a, b) =>
                a.localeCompare(b, 'en', {numeric: true}),
            ),
        [servers],
    );

    const counts: ServerCounts = useMemo(
        () => ({
            all: servers.length,
            physical: servers.filter((r) => r.type === 'physical').length,
            virtual: servers.filter((r) => r.type === 'virtual').length,
        }),
        [servers],
    );

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        return servers.filter((row) => {
            if (filter !== 'all' && row.type !== filter) return false;
            if (group && row.group !== group) return false;
            if (rack && rackOf(row) !== rack) return false;
            if (query) {
                const text = [row.name, row.ip, row.group, row.location].join(' ').toLowerCase();
                if (!text.includes(query)) return false;
            }
            return true;
        });
    }, [servers, filter, search, group, rack]);

    return (
        <>
            <PageHeader
                title="لیست سرورها"
                subtitle={`${toFa(counts.all)} سرور ثبت شده`}
                actions={
                    <>
                        <button
                            type="button"
                            className="glass flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm text-text-soft hover:border-line-strong"
                        >
                            <Download size={16}/>
                            خروجی Excel
                        </button>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => navigate('/servers/new')}
                                className="grad-accent flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-white"
                            >
                                <Plus size={16}/>
                                سرور جدید
                            </button>
                        )}
                    </>
                }
            />

            <ServerToolbar
                filter={filter}
                onFilterChange={setFilter}
                counts={counts}
                search={search}
                onSearchChange={setSearch}
                groups={groups}
                group={group}
                onGroupChange={setGroup}
                racks={racks}
                rack={rack}
                onRackChange={setRack}
            />

            {/* جدول در تبلت داخل خودش اسکرول می‌شود و کل صفحه تکان نمی‌خورد */}
            <div className="mt-6 min-w-0 overflow-x-auto rounded-3xl">
                <ServerTable rows={rows} total={counts.all}/>
            </div>
        </>
    );
}
