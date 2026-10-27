import {DEVICE_STYLE, RACK_UNITS, rackUsage, toFa, type RackData} from './RackColumn';

interface RackMiniProps {
    rack: RackData;
    active: boolean;
    onClick: () => void;
}

/** رک کوچک برای انتخاب رک: هر یونیت ۳ پیکسل، رنگ بر اساس وضعیت دستگاه */
export function RackMini({rack, active, onClick}: RackMiniProps) {
    const {valid, pct} = rackUsage(rack.devices);

    return (
        <button
            type="button"
            aria-pressed={active}
            aria-label={`رک ${rack.name}`}
            onClick={onClick}
            className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-3 py-2 ${
                active ? 'border-accent bg-accent/15' : 'glass border-line hover:border-line-strong'
            }`}
        >
      <span dir="ltr" className="text-sm font-bold">
        {rack.name}
      </span>
            <div
                className="grid w-8 rounded-[3px] bg-white/5 p-px"
                style={{gridTemplateRows: `repeat(${RACK_UNITS}, 3px)`}}
            >
                {valid.map((d) => (
                    <div
                        key={d.id}
                        style={{gridRow: `${RACK_UNITS - d.to + 1} / span ${d.to - d.from + 1}`}}
                        className={DEVICE_STYLE[d.state].body}
                    />
                ))}
            </div>
            <span className="text-[11px] text-muted">{toFa(pct)}٪</span>
        </button>
    );
}
