import {lazy} from 'react';
import {ScrollText} from 'lucide-react';
import type {AppModule} from "../../shared/types/module";

/** تاریخچه تغییرات سرورها؛ فقط برای Admin (route و منو) */
export const auditModule: AppModule = {
    id: 'audit',
    path: '/audit',
    title: 'تاریخچه تغییرات',
    icon: ScrollText,
    order: 90,
    page: lazy(() => import('./AuditLogPage')),
    adminOnly: true,
};
