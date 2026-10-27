import {Server} from 'lucide-react';

/** لوگو و نام برنامه بالای سایدبار */
export function SidebarBrand() {
    return (
        <div className="mb-6 flex items-center gap-3">
            <div className="grad-accent grid size-11 place-items-center rounded-xl">
                <Server size={22}/>
            </div>
            <div>
                <div className="font-bold">مدیریت زیرساخت</div>
                <div className="dir-ltr text-[11px] tracking-widest text-muted">SERVER INVENTORY</div>
            </div>
        </div>
    );
}
