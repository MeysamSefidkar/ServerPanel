import type {AppModule} from "../shared/types/module.ts";
import {dashboardModule} from "../features/dashboard";
import {racksModule, serversModule} from "../features/servers";

/**
 * فهرست همه ماژول‌های برنامه.
 * برای اضافه کردن یک بخش جدید: یک پوشه در features بساز و فقط یک خط اینجا اضافه کن.
 */
export const modules: AppModule[] = [
    dashboardModule,
    serversModule,
    racksModule,
].sort((a, b) => a.order - b.order);
