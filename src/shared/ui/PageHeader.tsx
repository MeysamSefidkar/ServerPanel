import type {ReactNode} from 'react';

interface Props {
    title: string;
    subtitle?: ReactNode;
    /** دکمه‌ها/جستجو در سمت چپ هدر (در تبلت زیر عنوان می‌آیند) */
    actions?: ReactNode;
}

/** هدر یکسان همه صفحات: عنوان و توضیح در راست، اکشن‌ها در چپ */
export function PageHeader({title, subtitle, actions}: Props) {
    return (
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div className="min-w-0">
                <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {actions && (
                <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">{actions}</div>
            )}
        </header>
    );
}
