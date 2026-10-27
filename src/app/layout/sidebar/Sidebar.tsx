import {SidebarBrand} from './SidebarBrand';
import {SidebarNav} from './SidebarNav';
import {SidebarUserCard} from './SidebarUserCard';

/** فقط قاب سایدبار؛ جایگاه (ثابت یا کشویی) را AppLayout تعیین می‌کند */
export function Sidebar() {
    return (
        <div className="flex h-full w-full flex-col gap-2 border-e border-line bg-panel p-5">
            <SidebarBrand/>
            <SidebarNav/>
            <SidebarUserCard/>
        </div>
    );
}
