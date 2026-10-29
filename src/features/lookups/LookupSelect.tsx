import {useLookupOptions, type LookupKind} from './lookupStore';

interface Props {
    kind: LookupKind;
    value: string;
    onChange: (value: string) => void;
    id?: string;
    className?: string;
}

/**
 * انتخاب از لیست lookup به‌جای متن آزاد.
 * اگر مقدار فعلی (از داده قدیمی) در لیست نباشد، همچنان نمایش داده می‌شود تا ویرایش آن را پاک نکند.
 */
export function LookupSelect({kind, value, onChange, id, className}: Props) {
    const options = useLookupOptions(kind);
    const legacy = value !== '' && !options.includes(value);

    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={
                className ??
                'w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-2'
            }
        >
            <option value="">— انتخاب کنید —</option>
            {legacy && <option value={value}>{value} (خارج از لیست)</option>}
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    );
}
