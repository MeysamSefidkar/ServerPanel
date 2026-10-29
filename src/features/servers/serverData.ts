import type {RackDevice} from './components/RackColumn';
import type {RackServerDetail} from './components/RackDetailPanel';
import type {ServerRow} from './components/ServerTable';

/**
 * داده‌ی نمونه و سازنده‌ی جزئیات سرور.
 * لیست نهایی سرورها (فیزیکی + مجازی) در serverStore ساخته می‌شود؛
 * این فایل فقط سرورهای مجازی اولیه و buildDetail را می‌دهد.
 * بعداً همه از API می‌آید.
 */

/** مشخصات نمونه بر اساس ارتفاع دستگاه (تعداد یونیت) */
const SPECS: Record<number, { cpu: string; ram: string; disk: string; raid: string }> = {
    1: {cpu: '8 Core', ram: '32 GB', disk: '1 TB', raid: 'RAID 1'},
    2: {cpu: '16 Core', ram: '64 GB', disk: '2 TB', raid: 'RAID 1'},
    4: {cpu: '32 Core', ram: '128 GB', disk: '8 TB', raid: 'RAID 10'},
};

const GROUPS = ['IT', 'مالی', 'فروش', 'زیرساخت', 'انبار'];
const OS_LIST = ['Windows Server 2022', 'Windows Server 2019', 'Ubuntu 22.04'];

const specOf = (d: RackDevice) => SPECS[d.to - d.from + 1] ?? SPECS[2];
const unitOf = (d: RackDevice) => (d.from === d.to ? `U${d.from}` : `U${d.from}-${d.to}`);

/** محل دستگاه، مثلاً «Rack C10 · U34-35». ServersPage رک را با regex از همین متن می‌خواند. */
export const locationOf = (d: RackDevice, rackName: string) => `Rack ${rackName} · ${unitOf(d)}`;

/** جزئیات یک سرور برای پنل نمای رک. سوئیچ و UPS جزئیات ندارند. */
export function buildDetail(device: RackDevice, rackName: string): RackServerDetail | null {
    if (device.state === 'network') return null;
    const spec = specOf(device);
    const off = device.state === 'off';
    return {
        id: device.id,
        name: device.name,
        status: device.state,
        kind: 'فیزیکی',
        cpu: spec.cpu,
        ram: spec.ram,
        disk: `${spec.disk} · ${spec.raid}`,
        os: OS_LIST[device.id % OS_LIST.length],
        group: GROUPS[device.id % GROUPS.length],
        ip: `10.0.${Number(rackName.slice(1))}.${(device.id % 250) + 1}`,
        location: locationOf(device, rackName),
        cpuUsage: off ? 0 : (((device.id * 37) % 80) + 10) / 100,
        ramUsage: off ? 0 : (((device.id * 53) % 70) + 20) / 100,
    };
}

/** سرورهای مجازی جایی در رک ندارند. نمونه‌اند. شناسه از ۱۰۰۱ شروع می‌شود تا با دستگاه‌های رک تداخل نکند. */
export const VIRTUAL_SERVERS: ServerRow[] = [
    {
        id: 1001,
        name: 'SRV-APP12',
        ip: '10.0.2.12',
        type: 'virtual',
        group: 'فروش',
        cpu: '8 vCPU',
        ram: '16 GB',
        ramUsage: 0.25,
        disk: '200 GB',
        location: 'Host: HV-03',
        status: 'active',
    },
    {
        id: 1002,
        name: 'SRV-WEB05',
        ip: '10.0.3.5',
        type: 'virtual',
        group: 'IT',
        cpu: '4 vCPU',
        ram: '8 GB',
        ramUsage: 0.12,
        disk: '100 GB',
        location: 'Host: HV-01',
        status: 'active',
    },
    {
        id: 1003,
        name: 'SRV-DC01',
        ip: '10.0.1.5',
        type: 'virtual',
        group: 'زیرساخت',
        cpu: '4 vCPU',
        ram: '16 GB',
        ramUsage: 0.3,
        disk: '120 GB',
        location: 'Host: HV-02',
        status: 'active',
    },
    {
        id: 1004,
        name: 'SRV-MAIL01',
        ip: '10.0.3.20',
        type: 'virtual',
        group: 'IT',
        cpu: '8 vCPU',
        ram: '32 GB',
        ramUsage: 0.6,
        disk: '500 GB',
        location: 'Host: HV-02',
        status: 'repair',
    },
];
