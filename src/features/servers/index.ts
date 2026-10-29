import {lazy} from 'react';
import {LayoutGrid, Server} from 'lucide-react';
import type {AppModule} from "../../shared/types/module";

/** معرفی ماژول سرورها به برنامه */
export const serversModule: AppModule = {
    id: 'servers',
    path: '/servers',
    title: 'سرورها',
    icon: Server,
    order: 2,
    page: lazy(() => import('./ServersPage')),
};

/** معرفی ماژول نمای رک به برنامه */
export const racksModule: AppModule = {
    id: 'racks',
    path: '/racks',
    title: 'نمای رک',
    icon: LayoutGrid,
    order: 3,
    page: lazy(() => import('./RackViewPage')),
};
