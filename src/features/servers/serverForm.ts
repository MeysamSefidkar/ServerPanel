import type {RackServerDetail} from './components/RackDetailPanel';
import type {ServerRow, ServerStatus} from './components/ServerTable';
import type {BladeSlot, PhysicalInput, ServerMeta, VirtualInput} from './serverStore';

/** تعداد یونیت‌های هر رک */
export const RACK_UNITS = 42;

/** بیشترین شماره‌ی Bay در شاسی Blade (مثلاً HP c7000 شانزده Bay نیم‌قد دارد) */
export const MAX_BAY = 16;

/** مقدار خالی تاریخ نصب وقتی تاریخ معلوم نیست */
export const UNKNOWN_DATE = 'نامشخص';

/** مدل‌های دیسک قابل انتخاب. برای مدل جدید فقط یک خط به این لیست اضافه کنید. */
export const DISK_MODELS: readonly string[] = [
    'HDD 300GB SAS 10K',
    'HDD 600GB SAS 10K',
    'HDD 900GB SAS 10K',
    'HDD 1.2TB SAS 10K',
    'HDD 1.8TB SAS 10K',
    'HDD 2.4TB SAS 10K',
    'HDD 4TB SATA 7.2K',
    'HDD 8TB SATA 7.2K',
    'SSD 240GB SATA',
    'SSD 480GB SATA',
    'SSD 960GB SATA',
    'SSD 1.92TB SATA',
    'SSD 3.84TB SAS',
    'NVMe 1.6TB',
    'NVMe 3.2TB',
];

export type ServerKind = 'physical' | 'virtual';
export type Bcp = '' | '1' | '2' | '3';
/** '' یعنی هنوز انتخاب نشده */
export type YesNo = '' | 'yes' | 'no';

/** یک ردیف دیسک: مدل و تعداد. تعداد به‌صورت متن نگه داشته می‌شود تا input کنترل‌شده باشد. */
export interface DiskEntry {
    model: string;
    count: string;
}

export const EMPTY_DISK: DiskEntry = {model: '', count: '1'};

/**
 * همه‌ی فیلدهای فرم به‌صورت متن نگه داشته می‌شوند تا input ها کنترل‌شده باشند.
 * تبدیل به عدد و تمیزکاری در validateServerForm و toPhysicalInput / toVirtualInput انجام می‌شود.
 */
export interface ServerFormValues {
    // هویت
    name: string;
    ips: string[];
    vlan: string;
    group: string;
    /** Server Group Level1 */
    level1: string;
    /** Server Group Level2 */
    level2: string;
    systemName: string;
    contractor: string;
    supervisor: string;
    bcp: Bcp;
    kind: ServerKind;
    status: ServerStatus;

    // سرور فیزیکی
    rack: string;
    startUnit: string;
    unitCount: string;
    /** شاسی Blade (Enclosure)، فقط برای سرور Blade */
    chassis: string;
    /** شماره‌ی اسلات سرور Blade داخل شاسی */
    bay: string;
    /** مدل سخت‌افزار سرور */
    model: string;

    // سرور مجازی
    cluster: string;
    host: string;

    // سخت‌افزار و نرم‌افزار
    cpu: string;
    ram: string;
    disks: DiskEntry[];
    os: string;

    // متفرقه
    installDate: string;
    zone: string;
    /** سرور به اینترنت وصل می‌شود (خروجی) */
    internetOut: YesNo;
    /** سرور از اینترنت در دسترس است (ورودی) */
    internetIn: YesNo;
    services: string;
    note: string;
}

export const EMPTY_SERVER_FORM: ServerFormValues = {
    name: '',
    ips: [''],
    vlan: '',
    group: '',
    level1: '',
    level2: '',
    systemName: '',
    contractor: '',
    supervisor: '',
    bcp: '',
    kind: 'physical',
    status: 'active',
    rack: '',
    startUnit: '',
    unitCount: '2',
    chassis: '',
    bay: '',
    model: '',
    cluster: '',
    host: '',
    cpu: '',
    ram: '',
    disks: [EMPTY_DISK],
    os: '',
    installDate: '',
    zone: '',
    internetOut: '',
    internetIn: '',
    services: '',
    note: '',
};

export type ServerFormErrors = Partial<Record<keyof ServerFormValues, string>>;

export interface ServerFormContext {
    /** نام همه‌ی رک‌ها، مثل C10 */
    racks: string[];
    /** از serverStore.isNameTaken */
    isNameTaken: (name: string, ignoreId?: number) => boolean;
    /** از serverStore.isRangeFree */
    /** از serverStore.isRangeFree؛ slot (شاسی و Bay) اجازه‌ی هم‌پوشانی Bladeهای یک شاسی را می‌دهد */
    isRangeFree: (rackName: string, from: number, to: number, ignoreId?: number, slot?: BladeSlot) => boolean;
    /** از serverStore.isBayTaken. اختیاری است. */
    isBayTaken?: (chassis: string, bay: string, ignoreId?: number) => boolean;

    /** شناسه‌ی سروری که ویرایش می‌شود؛ در حالت افزودن undefined */
    editingId?: number;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** ارقام فارسی و عربی را به لاتین تبدیل می‌کند تا کاربر با کیبورد فارسی هم درست وارد کند */
export function normalizeDigits(text: string) {
    return text.replace(/[۰-۹٠-٩]/g, (d) => {
        const fa = FA_DIGITS.indexOf(d);
        return String(fa >= 0 ? fa : AR_DIGITS.indexOf(d));
    });
}

const clean = (text: string) => normalizeDigits(text).trim();

const HOSTNAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;
const IPV4_RE = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const DATE_RE = /^\d{4}\/\d{1,2}\/\d{1,2}$/;

const toInt = (text: string) => {
    const t = clean(text);
    return /^\d+$/.test(t) ? Number(t) : null;
};

const rackOf = (v: ServerFormValues) => clean(v.rack).toUpperCase();

const ipList = (v: ServerFormValues) => v.ips.map(clean).filter(Boolean);

/** ردیف‌های دیسکی که مدل دارند. ردیف بدون مدل نادیده گرفته می‌شود. */
const usedDisks = (v: ServerFormValues) =>
    v.disks.map((d) => ({model: d.model.trim(), count: toInt(d.count)})).filter((d) => d.model);

/** لیست دیسک را به متن تبدیل می‌کند، مثل «2× HDD 300GB SAS 10K + 4× SSD 960GB SATA» */
const diskText = (v: ServerFormValues) =>
    usedDisks(v)
        .map((d) => `${d.count}× ${d.model}`)
        .join(' + ');

/** متن دیسک ذخیره‌شده را به ردیف‌های فرم برمی‌گرداند. متن قدیمی که این قالب را ندارد، یک ردیف با تعداد ۱ می‌شود. */
function parseDisks(text: string): DiskEntry[] {
    const parts = text.split(/\s*\+\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return [EMPTY_DISK];
    return parts.map((part) => {
        const m = part.match(/^(\d+)\s*[×x]\s*(.+)$/i);
        return m ? {count: m[1], model: m[2].trim()} : {count: '1', model: part};
    });
}

/** خطاهای فرم را برمی‌گرداند. اگر خالی باشد، فرم معتبر است. */
export function validateServerForm(v: ServerFormValues, ctx: ServerFormContext): ServerFormErrors {
    const e: ServerFormErrors = {};

    const name = clean(v.name);
    if (!name) e.name = 'نام سرور (hostname) الزامی است';
    else if (!HOSTNAME_RE.test(name)) e.name = 'فقط حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط؛ شروع با حرف یا عدد';
    else if (ctx.isNameTaken(name, ctx.editingId)) e.name = 'این نام قبلاً ثبت شده است';

    const ips = ipList(v);
    if (ips.length === 0) e.ips = 'حداقل یک IP لازم است';
    else if (ips.some((ip) => !IPV4_RE.test(ip))) e.ips = 'یکی از IP ها معتبر نیست (مثال: 10.0.1.11)';

    const vlan = clean(v.vlan);
    if (vlan) {
        const n = toInt(vlan);
        if (n === null || n < 1 || n > 4094) e.vlan = 'VLAN باید عددی بین ۱ تا ۴۰۹۴ باشد';
    }

    if (!clean(v.group)) e.group = 'گروه الزامی است';
    if (!clean(v.cpu)) e.cpu = 'CPU الزامی است';
    if (!clean(v.ram)) e.ram = 'RAM الزامی است';
    if (!clean(v.os)) e.os = 'سیستم‌عامل الزامی است';

    const disks = usedDisks(v);
    if (disks.some((d) => d.count === null || d.count < 1 || d.count > 99)) {
        e.disks = 'تعداد هر دیسک باید عددی بین ۱ تا ۹۹ باشد';
    } else if (new Set(disks.map((d) => d.model)).size !== disks.length) {
        e.disks = 'یک مدل دیسک دو بار انتخاب شده؛ تعدادشان را در یک ردیف بنویسید';
    }

    if (v.kind === 'physical') {
        const rack = rackOf(v);
        const from = toInt(v.startUnit);
        const count = toInt(v.unitCount);

        if (!ctx.racks.includes(rack)) e.rack = 'رک را انتخاب کنید';

        if (from === null || from < 1 || from > RACK_UNITS) {
            e.startUnit = `یونیت شروع باید بین ۱ تا ۴۲ باشد`;
        } else if (count === null || count < 1) {
            e.unitCount = 'تعداد یونیت باید حداقل ۱ باشد';
        } else if (from + count - 1 > RACK_UNITS) {
            e.unitCount = 'بازه‌ی یونیت از ۴۲ بیشتر است';
        } else if (
            ctx.racks.includes(rack) &&
            !ctx.isRangeFree(rack, from, from + count - 1, ctx.editingId, bladeSlot(v))
        ) {
            e.startUnit = `یونیت ${from} تا ${from + count - 1} در رک ${rack} آزاد نیست`;
        }

        const bay = clean(v.bay);
        if (bay) {
            const n = toInt(bay);
            if (n === null || n < 1 || n > MAX_BAY) e.bay = `Bay باید عددی بین ۱ تا ${MAX_BAY} باشد`;
            else if (!clean(v.chassis)) e.chassis = 'برای سرور Blade نام شاسی را وارد کنید';
            else if (ctx.isBayTaken?.(clean(v.chassis), String(n), ctx.editingId)) {
                e.bay = `Bay ${n} از شاسی ${clean(v.chassis)} قبلاً به سرور دیگری داده شده است`;
            }
        }
    } else if (!clean(v.cluster)) {
        e.cluster = 'نام Cluster الزامی است';
    }

    const date = clean(v.installDate);
    if (date && date !== UNKNOWN_DATE && !DATE_RE.test(date)) {
        e.installDate = 'تاریخ را مثل ۱۴۰۳/۰۲/۱۴ بنویسید، یا «نامشخص»';
    }

    return e;
}

export const hasErrors = (e: ServerFormErrors) => Object.keys(e).length > 0;
const serverExtras = (v: ServerFormValues) => ({
    ip: ipList(v).join(', '),
    group: clean(v.group),
    cpu: clean(v.cpu),
    ram: clean(v.ram),
    disk: diskText(v),
    os: clean(v.os),
});

/** شاسی و Bay فرم؛ فقط وقتی هر دو پر باشند معنا دارد */
function bladeSlot(v: ServerFormValues): BladeSlot | undefined {
    const chassis = clean(v.chassis);
    const bay = clean(v.bay);
    return chassis && bay ? {chassis, bay} : undefined;
}

/** فیلدهای تکمیلی فرم، برای نگهداری در serverStore */
function toMeta(v: ServerFormValues): ServerMeta {
    return {
        vlan: clean(v.vlan),
        level1: clean(v.level1),
        level2: clean(v.level2),
        systemName: clean(v.systemName),
        contractor: clean(v.contractor),
        supervisor: clean(v.supervisor),
        bcp: v.bcp,
        chassis: clean(v.chassis),
        bay: clean(v.bay),
        model: clean(v.model),
        cluster: clean(v.cluster),
        host: clean(v.host),
        zone: clean(v.zone),
        installDate: clean(v.installDate),
        internetOut: v.internetOut,
        internetIn: v.internetIn,
        services: v.services.trim(),
        note: v.note.trim(),
    };
}

/** فرم سرور فیزیکی را به ورودی serverStore.addPhysical / updatePhysical تبدیل می‌کند. قبلش validate کنید. */
export function toPhysicalInput(v: ServerFormValues): PhysicalInput {
    return {
        name: clean(v.name),
        subtitle: clean(v.model) || undefined,
        rackName: rackOf(v),
        from: Number(clean(v.startUnit)),
        size: Number(clean(v.unitCount)),
        state: v.status,
        extras: serverExtras(v),
        meta: toMeta(v),
    };
}

/**
 * فرم سرور مجازی را به ورودی serverStore.addVirtual / updateVirtual تبدیل می‌کند.
 * ramUsage در فرم نیست؛ در ویرایش مقدار فعلی را بفرستید.
 */
export function toVirtualInput(v: ServerFormValues, ramUsage = 0): VirtualInput {
    return {
        name: clean(v.name),
        ip: ipList(v).join(', '),
        group: clean(v.group),
        cpu: clean(v.cpu),
        ram: clean(v.ram),
        ramUsage,
        disk: diskText(v),
        location: [clean(v.cluster), clean(v.host)].filter(Boolean).join(' · '),
        status: v.status,
        meta: toMeta(v),
    };
}

/**
 * مقدار اولیه‌ی فرم ویرایش را از سرور موجود می‌سازد.
 * detail فقط برای سرور فیزیکی است و OS و دیسک کامل را می‌دهد.
 * meta (از serverStore.getMeta) فیلدهای تکمیلی را پر می‌کند؛ برای سرور قدیمی null است.
 */
export function formFromServer(
    row: ServerRow,
    detail: RackServerDetail | null,
    meta: ServerMeta | null = null,
): ServerFormValues {
    const ips = row.ip.split(',').map((s) => s.trim()).filter(Boolean);

    const base: ServerFormValues = {
        ...EMPTY_SERVER_FORM,
        name: row.name,
        ips: ips.length ? ips : [''],
        group: row.group,
        kind: row.type,
        status: row.status,
        cpu: detail?.cpu ?? row.cpu,
        ram: detail?.ram ?? row.ram,
        disks: parseDisks(detail?.disk ?? row.disk),
        os: detail?.os ?? '',
        ...(meta
            ? {
                vlan: meta.vlan,
                level1: meta.level1,
                level2: meta.level2,
                systemName: meta.systemName,
                contractor: meta.contractor,
                supervisor: meta.supervisor,
                bcp: meta.bcp as Bcp,
                chassis: meta.chassis,
                bay: meta.bay,
                model: meta.model,
                zone: meta.zone,
                installDate: meta.installDate,
                internetOut: meta.internetOut as YesNo,
                internetIn: meta.internetIn as YesNo,
                services: meta.services,
                note: meta.note,
            }
            : {}),
    };

    if (row.type === 'virtual') {
        if (meta) return {...base, cluster: meta.cluster, host: meta.host};
        const [cluster = '', host = ''] = row.location.split(' · ');
        return {...base, cluster, host};
    }

    const loc = row.location.match(/Rack ([CG]\d{1,2})\s*·\s*U(\d+)\s*-\s*(\d+)/);
    if (!loc) return base;

    const from = Number(loc[2]);
    const to = Number(loc[3]);
    return {...base, rack: loc[1], startUnit: String(from), unitCount: String(to - from + 1)}
}
