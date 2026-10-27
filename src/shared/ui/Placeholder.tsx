import type {ReactNode} from 'react';
import {Construction} from 'lucide-react';

/** جای خالی موقت برای صفحاتی که هنوز ساخته نشده‌اند */
export function Placeholder({children}: { children?: ReactNode }) {
    return (
        <div
            className="glass flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line-strong p-16 text-center text-muted">
            <Construction size={40} strokeWidth={1.5}/>
            <div>{children ?? 'این بخش در مراحل بعدی ساخته می‌شود.'}</div>
        </div>
    );
}
