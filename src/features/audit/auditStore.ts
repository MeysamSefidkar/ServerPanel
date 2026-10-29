import {useSyncExternalStore} from 'react';
import {getCurrentUser} from "../../shared/auth/useCurrentUser";

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditChange {
    field: string;   // برچسب فارسی، مثلاً «هاست»
    before: string;
    after: string;
}

export interface AuditEntry {
    id: number;
    at: string;      // ISO
    actor: string;   // DOMAIN\user
    action: AuditAction;
    serverId: number;
    serverName: string;
    changes: AuditChange[];
}

type NewAuditEntry = Omit<AuditEntry, 'id' | 'at' | 'actor'>;

let entries: AuditEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** ثبت یک تغییر. فقط از داخل store صدا زده شود. */
export function logChange(entry: NewAuditEntry): void {
    const user = getCurrentUser();
    entries = [
        {...entry, id: nextId++, at: new Date().toISOString(), actor: user.userName},
        ...entries,
    ];
    emit();
}

/** مقایسه‌ی دو رکورد و برگرداندن فیلدهای تغییرکرده. labels: کلید فیلد → برچسب فارسی */
export function diffFields(
    before: Record<string, string>,
    after: Record<string, string>,
    labels: Record<string, string>,
): AuditChange[] {
    const changes: AuditChange[] = [];
    for (const key of Object.keys(labels)) {
        const b = before[key] ?? '';
        const a = after[key] ?? '';
        if (b !== a) changes.push({field: labels[key], before: b, after: a});
    }
    return changes;
}

/** لیست تغییرات، جدیدترین اول */
export function useAuditLog(): AuditEntry[] {
    return useSyncExternalStore(subscribe, () => entries, () => entries);
}
