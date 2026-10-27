import {Cloud, HardDrive, MemoryStick, Server} from 'lucide-react';
import {PageHeader} from "../../shared/ui/PageHeader.tsx";
import {GrowthChart} from './components/GrowthChart';
import {ServerMixChart} from './components/ServerMixChart';
import {StatCard} from './components/StatCard';

export default function DashboardPage() {
    return (
        <>
            <PageHeader title="داشبورد" subtitle="نمای کلی زیرساخت سرورها"/>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
                <StatCard
                    label="کل سرورها"
                    value="۲۴۸"
                    icon={Server}
                    tone="accent"
                    trend="▲ ۶٪"
                    series={[20, 15, 18, 9, 12, 3]}
                />
                <StatCard
                    label="سرور فیزیکی"
                    value="۷۰"
                    icon={HardDrive}
                    tone="slate"
                    trend="▲ ۲٪"
                    series={[14, 16, 11, 12, 7, 6]}
                />
                <StatCard
                    label="سرور مجازی"
                    value="۱۷۸"
                    icon={Cloud}
                    tone="teal"
                    trend="▲ ۹٪"
                    series={[22, 17, 18, 10, 8, 2]}
                />
                <StatCard
                    label="مجموع RAM"
                    value="6.1 TB"
                    icon={MemoryStick}
                    tone="slate"
                    trend="▲ ۴٪"
                    series={[18, 19, 12, 14, 6, 4]}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">
                <div className="min-w-0 xl:col-span-2">
                    <GrowthChart/>
                </div>
                <div className="min-w-0">
                    <ServerMixChart/>
                </div>
            </div>
        </>
    );
}
