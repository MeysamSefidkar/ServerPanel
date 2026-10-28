import {useSyncExternalStore} from 'react';
import type {RackData, RackDevice, RackDeviceState} from './components/RackColumn';
import type {RackServerDetail} from './components/RackDetailPanel';
import type {ServerRow} from './components/ServerTable';
import {RACK_ROWS, type RackRowKey} from './rackData';
import {buildDetail, SERVERS} from './serverData';

/**
 * مخزن موقت داده در حافظه. لیست سرورها، نمای رک و فرم همه از اینجا می‌خوانند و می‌نویسند.
 * وقتی API آمد، فقط داخل این فایل عوض می‌شود و صفحه‌ها دست نمی‌خورند.
 * با رفرش صفحه، تغییرها پاک می‌شوند.
 */

const RACK_UNITS = 42;

/** مقادیری که فرم روی مقدار نمونه‌ی سرور فیزیکی می‌نویسد */
export type ServerExtras = Partial<Pick<ServerRow, 'ip' | 'group' | 'cpu' | 'ram' | 'disk'>> & { os?: string };

/** فیلدهای تکمیلی فرم که در ServerRow و RackDevice جا ندارند. همه متن‌اند، مثل فرم. */
export type ServerMeta = {
    vlan: string;
    level1: string;
    level2: string;
    systemName: string;
    contractor: string;
    supervisor: string;
    bcp: string;
    chassis: string;
    bay: string;
    model: string;
    cluster: string;
    host: string;
    zone: string;
    installDate: string;
    internetOut: string;
    internetIn: string;
    services: string;
    note: string;
};

/** جای Blade داخل شاسی؛ برای اجازه‌ی هم‌پوشانی چند Blade در یک بازه‌ی یونیت */
export type BladeSlot = { chassis: string; bay: string };

export type PhysicalInput = {
    name: string;
    subtitle?: string;
    rackName: string;
    from: number; // یونیت شروع (۱ = پایین رک)
    size: number; // تعداد یونیت
    state: Exclude<RackDeviceState, 'network'>;
    extras?: ServerExtras;
    meta?: ServerMeta;
};

export type VirtualInput = Omit<ServerRow, 'id' | 'type'> & { meta?: ServerMeta };

type Racks = Record<RackRowKey, RackData[]>;
type MetaMap = Record<number, ServerMeta>;
type State = {
    racks: Racks;
    virtuals: ServerRow[];
    extras: Record<number, ServerExtras>;
    meta: MetaMap;
    servers: ServerRow[]; // مشتق‌شده؛ برای useSyncExternalStore باید مرجع ثابت داشته باشد
};

function detailOf(device: RackDevice, rackName: string, extras: Record<number, ServerExtras>): RackServerDetail | null {
    const base = buildDetail(device, rackName);
    if (!base) return null;
    const x = extras[device.id];
    if (!x) return base;
    return {
        ...base,
        ip: x.ip ?? base.ip,
        group: x.group ?? base.group,
        cpu: x.cpu ?? base.cpu,
        ram: x.ram ?? base.ram,
        disk: x.disk ?? base.disk,
        os: x.os ?? base.os,
    };
}

function physicalRows(racks: Racks, extras: Record<number, ServerExtras>): ServerRow[] {
    return (Object.keys(racks) as RackRowKey[]).flatMap((key) =>
        racks[key].flatMap((rack) =>
            rack.devices.flatMap((device) => {
                const d = detailOf(device, rack.name, extras);
                if (!d) return [];
                const row: ServerRow = {
                    id: d.id,
                    name: d.name,
                    ip: d.ip,
                    type: 'physical',
                    group: d.group,
                    cpu: d.cpu,
                    ram: d.ram,
                    ramUsage: d.ramUsage,
                    disk: d.disk.split(' · ')[0], // در جدول بدون RAID
                    location: d.location,
                    status: d.status,
                };
                return [row];
            }),
        ),
    );
}

const make = (
    racks: Racks,
    virtuals: ServerRow[],
    extras: Record<number, ServerExtras>,
    meta: MetaMap,
): State => ({
    racks,
    virtuals,
    extras,
    meta,
    servers: [...physicalRows(racks, extras), ...virtuals],
});

let state: State = make(RACK_ROWS, SERVERS.filter((s) => s.type === 'virtual'), {}, {});
const listeners = new Set<() => void>();

function commit(patch: Partial<Omit<State, 'servers'>>) {
    const next = {...state, ...patch};
    state = make(next.racks, next.virtuals, next.extras, next.meta);
    listeners.forEach((l) => l());
}

function nextId() {
    let max = 0;
    for (const key of Object.keys(state.racks) as RackRowKey[])
        for (const r of state.racks[key]) for (const d of r.devices) max = Math.max(max, d.id);
    for (const v of state.virtuals) max = Math.max(max, v.id);
    return max + 1;
}

function findRack(racks: Racks, rackName: string) {
    return racks[rackName[0] as RackRowKey]?.find((r) => r.name === rackName) ?? null;
}

const norm = (s: string) => s.trim().toLowerCase();

/** دو Blade فقط وقتی کنار هم می‌نشینند که شاسی یکی و Bay متفاوت باشد */
function sameChassisOtherBay(slot: BladeSlot, other?: ServerMeta) {
    if (!other || !other.chassis.trim() || !other.bay.trim()) return false;
    return norm(other.chassis) === norm(slot.chassis) && other.bay.trim() !== slot.bay.trim();
}

function rangeFree(
    racks: Racks,
    meta: MetaMap,
    rackName: string,
    from: number,
    to: number,
    ignoreId?: number,
    slot?: BladeSlot,
) {
    if (from < 1 || to > RACK_UNITS || from > to) return false;
    const rack = findRack(racks, rackName);
    if (!rack) return false;
    const bladeSlot = slot && slot.chassis.trim() && slot.bay.trim() ? slot : undefined;
    return rack.devices.every(
        (d) =>
            d.id === ignoreId ||
            d.to < from ||
            d.from > to ||
            (bladeSlot !== undefined && sameChassisOtherBay(bladeSlot, meta[d.id])),
    );
}

function updateDevices(racks: Racks, rackName: string, fn: (ds: RackDevice[]) => RackDevice[]): Racks {
    const key = rackName[0] as RackRowKey;
    if (!findRack(racks, rackName)) throw new Error(`رک ${rackName} وجود ندارد`);
    return {
        ...racks,
        [key]: racks[key].map((r) =>
            r.name === rackName ? {...r, devices: fn(r.devices).sort((a, b) => b.to - a.to)} : r,
        ),
    };
}

function removeDevice(racks: Racks, id: number): Racks {
    const out = {} as Racks;
    for (const key of Object.keys(racks) as RackRowKey[]) {
        out[key] = racks[key].map((r) =>
            r.devices.some((d) => d.id === id) ? {...r, devices: r.devices.filter((d) => d.id !== id)} : r,
        );
    }
    return out;
}

function placeDevice(racks: Racks, meta: MetaMap, input: PhysicalInput, id: number): Racks {
    const to = input.from + input.size - 1;
    const slot = input.meta ? {chassis: input.meta.chassis, bay: input.meta.bay} : undefined;
    if (!rangeFree(racks, meta, input.rackName, input.from, to, id, slot)) {
        throw new Error(`یونیت ${input.from} تا ${to} در رک ${input.rackName} آزاد نیست`);
    }
    const device: RackDevice = {
        id,
        name: input.name.trim(),
        subtitle: input.subtitle?.trim() || undefined,
        from: input.from,
        to,
        state: input.state,
    };
    return updateDevices(racks, input.rackName, (ds) => [...ds, device]);
}

const withExtras = (id: number, x?: ServerExtras) => (x ? {...state.extras, [id]: x} : state.extras);
const withMeta = (id: number, m?: ServerMeta): MetaMap => (m ? {...state.meta, [id]: m} : state.meta);

// ───────── خواندن ─────────

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
};

/** همه‌ی سرورها (فیزیکی + مجازی) برای جدول */
export const useServers = () => useSyncExternalStore(subscribe, () => state.servers);

/** ردیف‌های رک برای نمای رک */
export const useRackRows = () => useSyncExternalStore(subscribe, () => state.racks);

export const getServer = (id: number) => state.servers.find((s) => s.id === id) ?? null;

/** جزئیات پنل رک، همراه با مقادیری که فرم ثبت کرده */
export const getDetail = (device: RackDevice, rackName: string) => detailOf(device, rackName, state.extras);

/** فیلدهای تکمیلی ثبت‌شده با فرم. برای سرور قدیمی که هنوز با فرم ثبت نشده null است. */
export const getMeta = (id: number): ServerMeta | null => state.meta[id] ?? null;

/**
 * برای فرم و RackUnitPicker: آیا این بازه‌ی یونیت خالی است؟
 * اگر slot (شاسی و Bay) بدهید، Blade دیگری از همان شاسی با Bay متفاوت مانع نمی‌شود.
 */
export const isRangeFree = (rackName: string, from: number, to: number, ignoreId?: number, slot?: BladeSlot) =>
    rangeFree(state.racks, state.meta, rackName, from, to, ignoreId, slot);

/** نام سرور (hostname) باید یکتا باشد */
export const isNameTaken = (name: string, ignoreId?: number) => {
    const n = name.trim().toLowerCase();
    return state.servers.some((s) => s.id !== ignoreId && s.name.toLowerCase() === n);
};

/** آیا این Bay از این شاسی قبلاً به سرور دیگری داده شده؟ */
export const isBayTaken = (chassis: string, bay: string, ignoreId?: number) =>
    Object.entries(state.meta).some(
        ([id, m]) =>
            Number(id) !== ignoreId &&
            norm(m.chassis) === norm(chassis) &&
            m.bay.trim() === bay.trim() &&
            m.chassis.trim() !== '',
    );

// ───────── نوشتن ─────────

export function addPhysical(input: PhysicalInput): number {
    const id = nextId();
    commit({
        racks: placeDevice(state.racks, state.meta, input, id),
        extras: withExtras(id, input.extras),
        meta: withMeta(id, input.meta),
    });
    return id;
}

export function updatePhysical(id: number, input: PhysicalInput) {
    const racks = placeDevice(removeDevice(state.racks, id), state.meta, input, id);
    commit({racks, extras: withExtras(id, input.extras), meta: withMeta(id, input.meta)});
}

export function addVirtual(input: VirtualInput): number {
    const id = nextId();
    const {meta, ...row} = input;
    commit({virtuals: [...state.virtuals, {...row, id, type: 'virtual'}], meta: withMeta(id, meta)});
    return id;
}

export function updateVirtual(id: number, input: VirtualInput) {
    const {meta, ...row} = input;
    commit({
        virtuals: state.virtuals.map((v) => (v.id === id ? {...row, id, type: 'virtual'} : v)),
        meta: withMeta(id, meta),
    });
}

export function removeServer(id: number) {
    const {[id]: _x, ...extras} = state.extras;
    const {[id]: _m, ...meta} = state.meta;
    commit({
        racks: removeDevice(state.racks, id),
        virtuals: state.virtuals.filter((v) => v.id !== id),
        extras,
        meta,
    });
}
