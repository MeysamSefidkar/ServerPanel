import {useState, type FormEvent, type ReactNode} from 'react';
import {Plus, X} from 'lucide-react';
import {
    DISK_MODELS,
    EMPTY_DISK,
    MAX_BAY,
    UNKNOWN_DATE,
    hasErrors,
    validateServerForm,
    type Bcp,
    type DiskEntry,
    type ServerFormContext,
    type ServerFormErrors,
    type ServerFormValues,
    type ServerKind,
    type YesNo,
} from '../serverForm';
import type {ServerStatus} from './ServerTable';
import {LookupSelect} from '../../lookups';

const KIND_OPTIONS: { value: ServerKind; label: string }[] = [
    {value: 'physical', label: 'فیزیکی'},
    {value: 'virtual', label: 'مجازی'},
];

const STATUS_OPTIONS: { value: ServerStatus; label: string }[] = [
    {value: 'active', label: 'فعال'},
    {value: 'repair', label: 'در تعمیر'},
    {value: 'off', label: 'خاموش'},
];

const BCP_OPTIONS: { value: Bcp; label: string }[] = [
    {value: '', label: 'انتخاب نشده'},
    {value: '1', label: 'سطح 1'},
    {value: '2', label: 'سطح 2'},
    {value: '3', label: 'سطح 3'},
];

const YES_NO_OPTIONS: { value: YesNo; label: string }[] = [
    {value: '', label: 'انتخاب نشده'},
    {value: 'yes', label: 'بله'},
    {value: 'no', label: 'خیر'},
];

const field = (error?: string, extra = '') =>
    `w-full rounded-xl border bg-panel px-3 py-2 text-sm text-text-soft placeholder:text-muted outline-none transition focus:border-white/40 ${
        error ? 'border-danger' : 'border-line'
    } ${extra}`;

function Section({title, children}: { title: string; children: ReactNode }) {
    return (
        <section className="glass rounded-2xl border border-line p-5">
            <h3 className="mb-4 text-sm font-bold text-text-soft">{title}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
        </section>
    );
}

function Field({
                   label,
                   hint,
                   error,
                   wide,
                   children,
               }: {
    label: string;
    /** توضیح کوتاه زیر فیلد */
    hint?: string;
    error?: string;
    wide?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={`flex min-w-0 flex-col gap-1.5 ${wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
            <span className="text-xs text-muted">{label}</span>
            {children}
            {error ? (
                <span className="text-xs text-danger">{error}</span>
            ) : (
                hint && <span className="text-[11px] leading-5 text-muted opacity-80">{hint}</span>
            )}
        </div>
    );
}

function YesNoSelect({value, onChange}: { value: YesNo; onChange: (v: YesNo) => void }) {
    return (
        <select className={field()} value={value} onChange={(e) => onChange(e.target.value as YesNo)}>
            {YES_NO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

interface ServerFormProps {
    initial: ServerFormValues;
    ctx: ServerFormContext;
    submitLabel: string;
    /** خطای ذخیره از سمت store (مثلاً بازه‌ی یونیت در لحظه‌ی ذخیره اشغال شده) */
    serverError?: string;
    onSubmit: (values: ServerFormValues) => void;
    onCancel: () => void;
}

export function ServerForm({initial, ctx, submitLabel, serverError, onSubmit, onCancel}: ServerFormProps) {
    const [values, setValues] = useState<ServerFormValues>(initial);
    const [errors, setErrors] = useState<ServerFormErrors>({});

    function set<K extends keyof ServerFormValues>(key: K, value: ServerFormValues[K]) {
        setValues((prev) => ({...prev, [key]: value}));
        setErrors((prev) => ({...prev, [key]: undefined}));
    }

    const setIp = (index: number, value: string) =>
        set(
            'ips',
            values.ips.map((ip, i) => (i === index ? value : ip)),
        );
    const addIp = () => set('ips', [...values.ips, '']);
    const removeIp = (index: number) => set('ips', values.ips.filter((_, i) => i !== index));

    const setDisk = (index: number, patch: Partial<DiskEntry>) =>
        set(
            'disks',
            values.disks.map((d, i) => (i === index ? {...d, ...patch} : d)),
        );
    const addDisk = () => set('disks', [...values.disks, EMPTY_DISK]);
    const removeDisk = (index: number) => set('disks', values.disks.filter((_, i) => i !== index));

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const found = validateServerForm(values, ctx);
        setErrors(found);
        if (!hasErrors(found)) onSubmit(values);
    }

    const hasFieldErrors = Object.values(errors).some(Boolean);
    const banner = serverError ?? (hasFieldErrors ? 'لطفاً خطاهای فرم را برطرف کنید.' : '');
    const isPhysical = values.kind === 'physical';
    const isEditing = ctx.editingId !== undefined;

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {banner && (
                <div className="rounded-xl border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-danger">
                    {banner}
                </div>
            )}

            <Section title="هویت و شبکه">
                <Field
                    label="نوع سرور"
                    wide
                    hint={isEditing ? 'نوع سرور بعد از ثبت قابل تغییر نیست.' : undefined}
                >
                    <div className="inline-flex w-fit rounded-xl border border-line p-1">
                        {KIND_OPTIONS.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                disabled={isEditing}
                                onClick={() => set('kind', o.value)}
                                className={`rounded-lg px-4 py-1.5 text-sm transition disabled:cursor-not-allowed ${
                                    values.kind === o.value
                                        ? 'grad-accent text-white'
                                        : 'text-muted hover:text-text-soft disabled:opacity-40 disabled:hover:text-muted'
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="نام سرور (Hostname)" error={errors.name}>
                    <input
                        dir="ltr"
                        className={field(errors.name, 'text-left')}
                        value={values.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="SRV-C10-01"
                    />
                </Field>

                <Field label="IP ها (حداقل یکی)" error={errors.ips}>
                    <div className="space-y-2">
                        {values.ips.map((ip, i) => (
                            <div key={i} className="grid grid-cols-[minmax(0,1fr)_2.5rem] gap-2">
                                <input
                                    dir="ltr"
                                    className={field(errors.ips, 'text-left')}
                                    value={ip}
                                    onChange={(e) => setIp(i, e.target.value)}
                                    placeholder="10.0.1.11"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIp(i)}
                                    disabled={values.ips.length === 1}
                                    aria-label="حذف IP"
                                    className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted hover:text-danger disabled:opacity-30"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addIp}
                            className="inline-flex items-center gap-1 text-xs text-muted hover:text-text-soft"
                        >
                            <Plus size={14}/>
                            افزودن IP
                        </button>
                    </div>
                </Field>

                <Field label="VLAN" error={errors.vlan}>
                    <input
                        dir="ltr"
                        className={field(errors.vlan, 'text-left')}
                        value={values.vlan}
                        onChange={(e) => set('vlan', e.target.value)}
                        placeholder="100"
                    />
                </Field>

                <Field label="گروه" error={errors.group}>
                    <LookupSelect
                        kind="group"
                        className={field(errors.group)}
                        value={values.group}
                        onChange={(v) => set('group', v)}
                    />
                </Field>

                <Field label="وضعیت">
                    <select
                        className={field()}
                        value={values.status}
                        onChange={(e) => set('status', e.target.value as ServerStatus)}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Server Group Level1">
                    <input className={field()} value={values.level1} onChange={(e) => set('level1', e.target.value)}/>
                </Field>

                <Field label="Server Group Level2">
                    <input className={field()} value={values.level2} onChange={(e) => set('level2', e.target.value)}/>
                </Field>

                <Field label="نام سیستم">
                    <input
                        className={field()}
                        value={values.systemName}
                        onChange={(e) => set('systemName', e.target.value)}
                    />
                </Field>

                <Field label="پیمانکار">
                    <LookupSelect
                        kind="contractor"
                        className={field()}
                        value={values.contractor}
                        onChange={(v) => set('contractor', v)}
                    />
                </Field>

                <Field label="ناظر">
                    <input
                        className={field()}
                        value={values.supervisor}
                        onChange={(e) => set('supervisor', e.target.value)}
                    />
                </Field>

                <Field label="سطح BCP">
                    <select className={field()} value={values.bcp} onChange={(e) => set('bcp', e.target.value as Bcp)}>
                        {BCP_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </Field>
            </Section>

            <Section title="محل استقرار">
                {isPhysical ? (
                    <>
                        <Field label="رک" error={errors.rack}>
                            <select
                                className={field(errors.rack)}
                                value={values.rack}
                                onChange={(e) => set('rack', e.target.value)}
                            >
                                <option value="">انتخاب رک</option>
                                {ctx.racks.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="یونیت شروع (از پایین، ۱ تا ۴۲)" error={errors.startUnit}>
                            <input
                                dir="ltr"
                                inputMode="numeric"
                                className={field(errors.startUnit, 'text-left')}
                                value={values.startUnit}
                                onChange={(e) => set('startUnit', e.target.value)}
                                placeholder="34"
                            />
                        </Field>

                        <Field label="تعداد یونیت" error={errors.unitCount}>
                            <input
                                dir="ltr"
                                inputMode="numeric"
                                className={field(errors.unitCount, 'text-left')}
                                value={values.unitCount}
                                onChange={(e) => set('unitCount', e.target.value)}
                                placeholder="2"
                            />
                        </Field>

                        <Field
                            label="مدل سرور"
                            hint="مدل سخت‌افزار خود سرور. زیر نام سرور در نمای رک نمایش داده می‌شود."
                        >
                            <input
                                dir="ltr"
                                className={field(undefined, 'text-left')}
                                value={values.model}
                                onChange={(e) => set('model', e.target.value)}
                                placeholder="HP ProLiant DL380 Gen10"
                            />
                        </Field>

                        <Field
                            label="شاسی (فقط Blade)"
                            hint="جعبه‌ای که چند سرور Blade داخل آن نصب می‌شوند (Enclosure). برای سرور رک‌مونت خالی بگذارید."
                            error={errors.chassis}
                        >
                            <input
                                dir="ltr"
                                className={field(errors.chassis, 'text-left')}
                                value={values.chassis}
                                onChange={(e) => set('chassis', e.target.value)}
                                placeholder="HP c7000 - C10"
                            />
                        </Field>

                        <Field
                            label="Bay (فقط Blade)"
                            hint={`شماره‌ی اسلات سرور Blade داخل شاسی (۱ تا ${MAX_BAY}).`}
                            error={errors.bay}
                        >
                            <input
                                dir="ltr"
                                inputMode="numeric"
                                className={field(errors.bay, 'text-left')}
                                value={values.bay}
                                onChange={(e) => set('bay', e.target.value)}
                                placeholder="14"
                            />
                        </Field>
                    </>
                ) : (
                    <>
                        <Field label="Cluster" error={errors.cluster}>
                            <input
                                className={field(errors.cluster)}
                                value={values.cluster}
                                onChange={(e) => set('cluster', e.target.value)}
                            />
                        </Field>

                        <Field label="Host">
                            <input
                                className={field()}
                                value={values.host}
                                onChange={(e) => set('host', e.target.value)}
                            />
                        </Field>
                    </>
                )}
            </Section>

            <Section title="سخت‌افزار و نرم‌افزار">
                <Field label="CPU" error={errors.cpu}>
                    <input
                        className={field(errors.cpu)}
                        value={values.cpu}
                        onChange={(e) => set('cpu', e.target.value)}
                        placeholder="2 x 16 Core"
                    />
                </Field>

                <Field label="RAM" error={errors.ram}>
                    <input
                        className={field(errors.ram)}
                        value={values.ram}
                        onChange={(e) => set('ram', e.target.value)}
                        placeholder="64 GB"
                    />
                </Field>

                <Field label="سیستم‌عامل" error={errors.os}>
                    <LookupSelect
                        kind="os"
                        className={field(errors.os)}
                        value={values.os}
                        onChange={(v) => set('os', v)}
                    />
                </Field>

                <Field label="دیسک‌ها (مدل و تعداد)" error={errors.disks} wide>
                    <div className="space-y-2">
                        {values.disks.map((disk, i) => {
                            // مقدار قدیمی که در لیست مدل‌ها نیست هم باید در لیست بماند تا پاک نشود
                            const legacy = disk.model && !DISK_MODELS.includes(disk.model);
                            return (
                                <div key={i} className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.5rem] gap-2">
                                    <select
                                        dir="ltr"
                                        className={field(errors.disks, 'text-left')}
                                        value={disk.model}
                                        onChange={(e) => setDisk(i, {model: e.target.value})}
                                    >
                                        <option value="">انتخاب مدل دیسک</option>
                                        {legacy && <option value={disk.model}>{disk.model}</option>}
                                        {DISK_MODELS.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        dir="ltr"
                                        inputMode="numeric"
                                        aria-label="تعداد"
                                        placeholder="تعداد"
                                        className={field(errors.disks, 'text-center')}
                                        value={disk.count}
                                        onChange={(e) => setDisk(i, {count: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDisk(i)}
                                        disabled={values.disks.length === 1}
                                        aria-label="حذف دیسک"
                                        className="grid size-10 place-items-center rounded-xl border border-line text-muted hover:text-danger disabled:opacity-30"
                                    >
                                        <X size={16}/>
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addDisk}
                            className="inline-flex items-center gap-1 text-xs text-muted hover:text-text-soft"
                        >
                            <Plus size={14}/>
                            افزودن مدل دیسک
                        </button>
                    </div>
                </Field>
            </Section>

            <Section title="اطلاعات تکمیلی">
                <Field label="تاریخ نصب" error={errors.installDate}>
                    <input
                        dir="ltr"
                        className={field(errors.installDate, 'text-left')}
                        value={values.installDate}
                        onChange={(e) => set('installDate', e.target.value)}
                        placeholder={`1403/02/14 یا ${UNKNOWN_DATE}`}
                    />
                </Field>

                <Field label="ناحیه (Zone)">
                    <LookupSelect
                        kind="zone"
                        className={field()}
                        value={values.zone}
                        onChange={(v) => set('zone', v)}
                    />
                </Field>

                <Field label="اتصال به اینترنت" hint="سرور به اینترنت دسترسی دارد (خروجی).">
                    <YesNoSelect value={values.internetOut} onChange={(v) => set('internetOut', v)}/>
                </Field>

                <Field label="اتصال از اینترنت" hint="سرور از اینترنت در دسترس است (ورودی).">
                    <YesNoSelect value={values.internetIn} onChange={(v) => set('internetIn', v)}/>
                </Field>

                <Field label="سرویس‌ها" wide>
                    <textarea
                        rows={2}
                        className={field(undefined, 'resize-y')}
                        value={values.services}
                        onChange={(e) => set('services', e.target.value)}
                    />
                </Field>

                <Field label="یادداشت" wide>
                    <textarea
                        rows={2}
                        className={field(undefined, 'resize-y')}
                        value={values.note}
                        onChange={(e) => set('note', e.target.value)}
                    />
                </Field>
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text-soft"
                >
                    انصراف
                </button>
                <button type="submit" className="grad-accent rounded-xl px-6 py-2.5 text-sm font-bold text-white">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
