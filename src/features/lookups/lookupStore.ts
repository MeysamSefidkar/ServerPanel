import {useSyncExternalStore} from 'react';

/** مقادیر کنترل‌شده فرم سرور که باید از یک لیست انتخاب شوند. */
export type LookupKind = 'group' | 'zone' | 'os' | 'contractor';

export const LOOKUP_KINDS: { kind: LookupKind; label: string; hint: string }[] = [
    {kind: 'group', label: 'گروه', hint: 'گروه سرور'},
    {kind: 'zone', label: 'زون', hint: 'زون شبکه'},
    {kind: 'os', label: 'سیستم‌عامل', hint: 'نسخه سیستم‌عامل'},
    {kind: 'contractor', label: 'پیمانکار', hint: 'پیمانکار پشتیبان'},
];

type State = Record<LookupKind, string[]>;

const STORAGE_KEY = 'serverinventory.lookups.v1';
const EMPTY: State = {group: [], zone: [], os: [], contractor: []};

const collator = new Intl.Collator('fa');
const sortValues = (v: string[]) => [...v].sort(collator.compare);

function load(): State {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<State>;
            return {
                group: parsed.group ?? [],
                zone: parsed.zone ?? [],
                os: parsed.os ?? [],
                contractor: parsed.contractor ?? [],
            };
        }
    } catch {
        /* داده خراب یا localStorage در دسترس نیست */
    }
    return EMPTY;
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
    state = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* ذخیره‌سازی ناموفق؛ فقط در حافظه می‌ماند */
    }
    listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
}

const exists = (kind: LookupKind, value: string) =>
    state[kind].some((v) => v.toLowerCase() === value.toLowerCase());

/** افزودن مقدار. در صورت خطا متن خطا برمی‌گردد، در غیر این صورت null. */
export function addLookup(kind: LookupKind, raw: string): string | null {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (!value) return 'مقدار نمی‌تواند خالی باشد.';
    if (exists(kind, value)) return 'این مقدار قبلاً ثبت شده است.';
    commit({...state, [kind]: sortValues([...state[kind], value])});
    return null;
}

/** حذف مقدار. بررسی «در حال استفاده بودن» وظیفه فراخواننده است. */
export function removeLookup(kind: LookupKind, value: string) {
    commit({...state, [kind]: state[kind].filter((v) => v !== value)});
}

/** افزودن دسته‌ای مقادیر موجود (مثلاً از داده فعلی سرورها)؛ تکراری‌ها نادیده گرفته می‌شوند. */
export function seedLookups(kind: LookupKind, values: Iterable<string>) {
    const next = [...state[kind]];
    for (const raw of values) {
        const v = raw?.trim().replace(/\s+/g, ' ');
        if (v && !next.some((x) => x.toLowerCase() === v.toLowerCase())) next.push(v);
    }
    if (next.length !== state[kind].length) commit({...state, [kind]: sortValues(next)});
}

export function getLookups(kind: LookupKind): string[] {
    return state[kind];
}

export function useLookupOptions(kind: LookupKind): string[] {
    return useSyncExternalStore(subscribe, () => state[kind]);
}
