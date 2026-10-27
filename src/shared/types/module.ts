import type {ComponentType, LazyExoticComponent} from 'react';
import type {LucideIcon} from 'lucide-react';

/**
 * قرارداد هر ماژول (feature) برنامه.
 * هر پوشه در src/features یک شیء از این نوع export می‌کند
 * و سایدبار و مسیرها (routes) خودکار از روی آن ساخته می‌شوند.
 */
export interface AppModule {
    /** شناسه یکتا، مثلاً 'servers' */
    id: string;
    /** آدرس صفحه، مثلاً '/servers' */
    path: string;
    /** عنوان در منو */
    title: string;
    /** آیکون منو */
    icon: LucideIcon;
    /** ترتیب نمایش در منو */
    order: number;
    /** صفحه — lazy تا فقط هنگام باز شدن دانلود شود (سرعت بیشتر) */
    page: LazyExoticComponent<ComponentType>;
    /** فقط برای نقش Admin نمایش داده شود */
    adminOnly?: boolean;
    /** اگر false باشد در منو نمی‌آید (مثلاً صفحه جزئیات سرور) */
    showInMenu?: boolean;
}
