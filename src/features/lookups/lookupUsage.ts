import {getFieldValues, useServers} from '../servers/serverStore';
import {LOOKUP_KINDS, seedLookups, type LookupKind} from './lookupStore';

const norm = (s: string) => s.trim().toLowerCase();

/** تعداد سرورهایی که از یک مقدار lookup استفاده می‌کنند. */
export function countUsage(kind: LookupKind, value: string): number {
    const v = norm(value);
    return getFieldValues(kind).filter((x) => norm(x) === v).length;
}

/**
 * هوک برای صفحه‌ها: به serverStore گوش می‌دهد تا با تغییر سرورها شمارش دوباره حساب شود.
 * const usage = useUsage();  →  usage(kind, value)
 */
export function useUsage() {
    useServers();
    return countUsage;
}

/** مقادیر موجود در سرورها را به لیست‌ها اضافه می‌کند (فقط موارد جدید). */
export function syncLookupsFromServers() {
    for (const {kind} of LOOKUP_KINDS) seedLookups(kind, getFieldValues(kind));
}
