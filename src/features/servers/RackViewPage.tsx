import {useState} from 'react';
import {PageHeader} from "../../shared/ui/PageHeader.tsx";
import {useCurrentUser} from "../../shared/auth/useCurrentUser.ts";
import {RackColumn} from './components/RackColumn';
import {RackMini} from './components/RackMini';
import {RackDetailPanel} from './components/RackDetailPanel';
import {RACK_ROWS, type RackRowKey} from './rackData';
import {buildDetail} from './serverData';

// رنگ‌ها باید با DEVICE_STYLE در RackColumn یکی باشند
const LEGEND = [
    {label: 'فعال', className: 'bg-linear-to-br from-success to-success/70'},
    {label: 'در تعمیر', className: 'bg-linear-to-br from-warning to-warning/70'},
    {label: 'خاموش', className: 'bg-off'},
    {label: 'شبکه / برق', className: 'grad-slate'},
];

const ROW_KEYS: RackRowKey[] = ['C', 'G'];

/** اولین رکی که دستگاه دارد؛ اگر ردیف کاملاً خالی بود، اولین رک */
const firstRack = (key: RackRowKey) => (RACK_ROWS[key].find((r) => r.devices.length > 0) ?? RACK_ROWS[key][0]).name;

/** صفحه نمای رک: نوار انتخاب رک، رک بزرگ و جزئیات دستگاه انتخاب‌شده */
export default function RackViewPage() {
    const {role} = useCurrentUser();
    const [rowKey, setRowKey] = useState<RackRowKey>('C');
    const [rackName, setRackName] = useState(() => firstRack('C'));
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const racks = RACK_ROWS[rowKey];
    const rack = racks.find((r) => r.name === rackName) ?? racks[0];

    const device = rack.devices.find((d) => d.id === selectedId);
    const detail = device ? buildDetail(device, rack.name) : null;

    const changeRow = (key: RackRowKey) => {
        setRowKey(key);
        setRackName(firstRack(key));
        setSelectedId(null);
    };

    const changeRack = (name: string) => {
        setRackName(name);
        setSelectedId(null);
    };

    return (
        <>
            <PageHeader
                title="نمای رک"
                subtitle="چیدمان فیزیکی سرورها در اتاق سرور · رک‌های ۴۲ یونیتی"
                actions={
                    <ul className="flex flex-wrap items-center gap-4 text-xs text-text-soft">
                        {LEGEND.map((l) => (
                            <li key={l.label} className="flex items-center gap-2">
                                <span className={`size-4 rounded-[5px] ${l.className}`}/>
                                {l.label}
                            </li>
                        ))}
                    </ul>
                }
            />

            <div role="tablist" aria-label="ردیف رک" className="mb-4 flex gap-2">
                {ROW_KEYS.map((key) => {
                    const active = key === rowKey;
                    const count = RACK_ROWS[key].reduce((sum, r) => sum + r.devices.length, 0);
                    return (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => changeRow(key)}
                            className={`h-10 rounded-full px-5 text-sm font-bold ${
                                active ? 'grad-accent text-white' : 'glass border border-line text-text-soft hover:border-line-strong'
                            }`}
                        >
                            ردیف {key}
                            <span className="ms-2 text-xs opacity-80">{count} دستگاه</span>
                        </button>
                    );
                })}
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {racks.map((r) => (
                    <RackMini key={r.name} rack={r} active={r.name === rack.name} onClick={() => changeRack(r.name)}/>
                ))}
            </div>

            {/*
              زیر xl: ستونی (رک بالا، جزئیات پایین).
              از xl به بالا: کنار هم. در RTL اولین فرزند سمت راست است: رک راست، جزئیات چپ.
            */}
            <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start">
                <div className="flex min-w-0 flex-1 justify-center">
                    <RackColumn name={rack.name} devices={rack.devices} selectedId={selectedId}
                                onSelect={setSelectedId}/>
                </div>

                <div className="w-full xl:sticky xl:top-4 xl:w-72 xl:shrink-0">
                    <RackDetailPanel server={detail} canEdit={role === 'Admin'}/>
                </div>
            </div>
        </>
    );
}
