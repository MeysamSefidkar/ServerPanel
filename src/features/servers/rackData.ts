import type {RackData, RackDevice, RackDeviceState} from './components/RackColumn';

/** شماره‌ی رک‌ها در هر ردیف: 5 تا 17 */
const NUMBERS = Array.from({length: 13}, (_, i) => i + 5);

/** اندازه‌ی نمونه‌ی دستگاه‌ها (به یونیت)، به‌صورت چرخشی */
const SIZES = [2, 1, 2, 4, 1, 2];

let nextId = 1;

/** وضعیت نمونه: بیشتر فعال، چند مورد تعمیر و خاموش */
function stateOf(i: number, seed: number): RackDeviceState {
    const k = i + seed;
    if (k % 7 === 3) return 'repair';
    if (k % 11 === 5) return 'off';
    return 'active';
}

/** داده‌ی نمونه‌ی یک رک؛ از بالا (U42) به پایین چیده می‌شود. count = 0 یعنی رک خالی */
function makeRack(name: string, count: number): RackData {
    const devices: RackDevice[] = [];
    const seed = Number(name.slice(1));
    let top = 42;

    if (count >= 8) {
        devices.push({id: nextId++, name: `SW-${name}`, from: top, to: top, state: 'network'});
        top -= 2;
    }

    for (let i = 0; i < count; i++) {
        const size = SIZES[i % SIZES.length];
        const from = top - size + 1;
        if (from < 1) break;
        devices.push({
            id: nextId++,
            name: `SRV-${name}-${String(i + 1).padStart(2, '0')}`,
            subtitle: size > 1 ? 'Dell R750' : undefined,
            from,
            to: top,
            state: stateOf(i, seed),
        });
        top = from - 1 - (i % 2); // بعد از هر دو دستگاه یک یونیت فاصله
    }

    return {name, devices};
}

/** تعداد سرور هر رک (نمونه). رک‌های بدون عدد خالی‌اند. C6 در اکسل جایگاه یونیت ندارد. */
const COUNTS: Record<'C' | 'G', Record<number, number>> = {
    C: {7: 2, 8: 8, 9: 8, 10: 12, 11: 8, 12: 1, 14: 6, 15: 5, 16: 10},
    G: {7: 2, 8: 6, 9: 13, 10: 5, 13: 2, 14: 6, 15: 1, 16: 4},
};

export type RackRowKey = 'C' | 'G';

/** ردیف‌های رک: هرکدام ۱۳ رک ۴۲ یونیتی. بعداً از API می‌آید. */
export const RACK_ROWS: Record<RackRowKey, RackData[]> = {
    C: NUMBERS.map((n) => makeRack(`C${n}`, COUNTS.C[n] ?? 0)),
    G: NUMBERS.map((n) => makeRack(`G${n}`, COUNTS.G[n] ?? 0)),
};
