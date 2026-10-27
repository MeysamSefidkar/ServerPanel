/** نشانگر بارگذاری (هنگام لود صفحات lazy) */
export function Loader({text = 'در حال بارگذاری…'}: { text?: string }) {
    return (
        <div role="status" className="flex items-center justify-center gap-3 p-10 text-muted">
            <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-accent-2"/>
            <span>{text}</span>
        </div>
    );
}
