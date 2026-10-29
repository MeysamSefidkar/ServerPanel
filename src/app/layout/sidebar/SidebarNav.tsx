import {NavLink} from 'react-router-dom';
import clsx from 'clsx';
import {modules} from "../../modules.ts";
import {useCurrentUser} from "../../../shared/auth/useCurrentUser.ts";

/** منوی اصلی؛ خودکار از روی فهرست ماژول‌ها ساخته می‌شود */
export function SidebarNav() {
    const user = useCurrentUser();

    // فقط ماژول‌هایی که باید در منو باشند و کاربر اجازه دیدنشان را دارد
    const items = modules.filter(
        (m) => m.showInMenu !== false && (!m.adminOnly || user.role === 'Admin'),
    );

    return (
        <>
            <div className="px-3 text-xs text-muted">منو</div>
            <nav className="flex flex-1 flex-col gap-1">
                {items.map(({id, path, title, icon: Icon}) => (
                    <NavLink
                        key={id}
                        to={path}
                        end={path === '/'}
                        className={({isActive}) =>
                            clsx(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                isActive
                                    ? 'grad-accent font-medium text-white'
                                    : 'text-text-soft hover:bg-white/5 hover:text-white',
                            )
                        }
                    >
                        <Icon size={20} strokeWidth={1.8}/>
                        <span>{title}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
