import {ChevronDown, Search, SlidersHorizontal} from 'lucide-react';

export type ServerFilter = 'all' | 'physical' | 'virtual';

/** شمارش هر سوییچ */
export type ServerCounts = Record<ServerFilter, number>;

const FILTERS: { value: ServerFilter; label: string }[] = [
    {value: 'all', label: 'همه'},
    {value: 'physical', label: 'فیزیکی'},
    {value: 'virtual', label: 'مجازی'},
];

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

interface ServerToolbarProps {
    filter: ServerFilter;
    onFilterChange: (value: ServerFilter) => void;
    counts: ServerCounts;

    search: string;
    onSearchChange: (value: string) => void;

    /** مقدار '' یعنی «همه» */
    groups: string[];
    group: string;
    onGroupChange: (value: string) => void;

    /** مقدار '' یعنی «همه» */
    racks: string[];
    rack: string;
    onRackChange: (value: string) => void;

    onMoreFilters?: () => void;
}

/** نوار فیلتر و جستجوی لیست سرورها */
export function ServerToolbar({
                                  filter,
                                  onFilterChange,
                                  counts,
                                  search,
                                  onSearchChange,
                                  groups,
                                  group,
                                  onGroupChange,
                                  racks,
                                  rack,
                                  onRackChange,
                                  onMoreFilters,
                              }: ServerToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* سوییچ همه / فیزیکی / مجازی */}
            <div className="glass flex h-12 items-center gap-1 rounded-full border border-line p-1">
                {FILTERS.map((f) => {
                    const active = f.value === filter;
                    return (
                        <button
                            key={f.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onFilterChange(f.value)}
                            className={`h-10 rounded-full px-4 text-xs transition-colors ${
                                active ? 'grad-accent font-bold text-white' : 'text-muted hover:text-text-soft'
                            }`}
                        >
                            {f.label}
                            <span className="ms-1.5 opacity-80">{toFa(counts[f.value])}</span>
                        </button>
                    );
                })}
            </div>

            {/* جستجو: در موبایل و تبلت ردیف کامل، از md به بالا کنار بقیه */}
            <div className="relative min-w-0 basis-full md:basis-auto md:min-w-60 md:flex-1">
                <Search size={16} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted"/>
                <input
                    type="search"
                    dir="auto"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="نام، IP یا سریال ..."
                    className="glass h-12 w-full rounded-full border border-line ps-11 pe-4 text-sm outline-none placeholder:text-muted focus:border-accent/70"
                />
            </div>

            {/* گروه */}
            <label
                className="glass relative flex h-12 items-center gap-2 rounded-full border border-line ps-4 pe-10 text-sm">
                <span className="text-muted">گروه:</span>
                <select
                    value={group}
                    onChange={(e) => onGroupChange(e.target.value)}
                    className="appearance-none bg-transparent outline-none"
                >
                    <option value="" className="bg-bg-2">همه</option>
                    {groups.map((g) => (
                        <option key={g} value={g} className="bg-bg-2">
                            {g}
                        </option>
                    ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute end-4 text-muted"/>
            </label>

            {/* رک */}
            <label
                className="glass relative flex h-12 items-center gap-2 rounded-full border border-line ps-4 pe-10 text-sm">
                <span className="text-muted">رک:</span>
                <select
                    value={rack}
                    onChange={(e) => onRackChange(e.target.value)}
                    className="appearance-none bg-transparent outline-none"
                >
                    <option value="" className="bg-bg-2">همه</option>
                    {racks.map((r) => (
                        <option key={r} value={r} className="bg-bg-2">
                            {r}
                        </option>
                    ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute end-4 text-muted"/>
            </label>

            {/* فیلتر پیشرفته */}
            <button
                type="button"
                onClick={onMoreFilters}
                className="glass flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm text-text-soft hover:border-line-strong"
            >
                <SlidersHorizontal size={16}/>
                فیلتر
            </button>
        </div>
    );
}
