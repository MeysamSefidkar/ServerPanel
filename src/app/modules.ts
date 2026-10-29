import type {AppModule} from '../shared/types/module';
import {dashboardModule} from '../features/dashboard';
import {racksModule, serversModule} from '../features/servers';
import {auditModule} from '../features/audit';
import {lookupsModule} from '../features/lookups';


export const modules: AppModule[] = [
    dashboardModule,
    serversModule,
    racksModule,
    lookupsModule,
    auditModule,
].sort((a, b) => a.order - b.order);
