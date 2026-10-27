import {Suspense, useState} from 'react';
import {Outlet} from 'react-router-dom';
import {Menu} from 'lucide-react';
import {Sidebar} from './sidebar/Sidebar';
import {Loader} from '../../shared/ui/Loader.tsx';

/**
 * قاب ثابت همه صفحات.
 * - lg به بالا (لپ‌تاپ، مانیتور، تلویزیون): سایدبار ثابت کنار محتوا.
 * - زیر lg (تبلت): سایدبار پنهان است و با دکمه‌ی منو به‌صورت کشو باز می‌شود.
 * چون dir="rtl" است، سایدبار سمت راست قرار می‌گیرد.
 */
export function AppLayout() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* پس‌زمینه‌ی تیره وقتی کشو باز است (فقط زیر lg) */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                onClick={(e) => {
                    // بعد از کلیک روی یک لینک منو، کشو بسته شود
                    if ((e.target as HTMLElement).closest('a')) setOpen(false);
                }}
                className={`fixed inset-y-0 right-0 z-50 h-screen w-sidebar shrink-0 transition-[transform,visibility] duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:visible ${
                    open ? 'translate-x-0' : 'invisible translate-x-full'
                }`}
            >
                <Sidebar/>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* نوار بالا فقط در تبلت و کوچک‌تر */}
                <header
                    className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-bg-1/90 px-4 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-label="باز کردن منو"
                        className="glass grid size-10 place-items-center rounded-xl border border-line"
                    >
                        <Menu className="size-5"/>
                    </button>
                </header>

                <main className="mx-auto w-full min-w-0 max-w-[140rem] flex-1 p-4 sm:p-6 lg:p-7 2xl:p-8">
                    <Suspense fallback={<Loader/>}>
                        <Outlet/>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
