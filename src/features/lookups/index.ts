import {lazy} from 'react';
import {ListChecks} from 'lucide-react';
import type {AppModule} from "../../shared/types/module";

/** مدیریت مقادیر انتخابی فرم (گروه، زون، سیستم‌عامل، پیمانکار)؛ فقط Admin */
export const lookupsModule: AppModule = {
    id: 'lookups',
    path: '/lookups',
    title: 'مدیریت لیست‌ها',
    icon: ListChecks,
    order: 80,
    page: lazy(() => import('./LookupsPage')),
    adminOnly: true,
};

export {LookupSelect} from './LookupSelect';
export {useLookupOptions, seedLookups, type LookupKind} from './lookupStore';
