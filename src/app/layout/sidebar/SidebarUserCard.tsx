import {useCurrentUser} from "../../../shared/auth/useCurrentUser.ts";

/** کارت کاربر واردشده، پایین سایدبار */
export function SidebarUserCard() {
    const user = useCurrentUser();

    return (
        <div className="glass flex items-center gap-3 rounded-2xl border border-line p-3">
            <div className="grad-teal grid size-10 shrink-0 place-items-center rounded-full font-bold">
                {user.displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user.displayName}</div>
                <div className="dir-ltr truncate text-start text-xs text-muted">{user.userName}</div>
            </div>
            <span className="rounded-md bg-accent/25 px-2 py-0.5 text-[11px] text-accent-2">
        {user.role}
      </span>
        </div>
    );
}
