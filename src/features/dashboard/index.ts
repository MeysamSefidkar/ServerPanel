import {lazy} from 'react';
import {LayoutDashboard} from 'lucide-react';
import type {AppModule} from "../../shared/types/module.ts";

/** معرفی ماژول داشبورد به برنامه */
export const dashboardModule: AppModule = {
    id: 'dashboard',
    path: '/',
    title: 'داشبورد',
    icon: LayoutDashboard,
    order: 1,
    page: lazy(() => import('./DashboardPage')),
};
