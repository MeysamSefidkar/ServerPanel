import {Link} from 'react-router-dom';
import {PageHeader} from "../shared/ui/PageHeader.tsx";
import {Placeholder} from "../shared/ui/Placeholder.tsx";

export function NotFoundPage() {
    return (
        <>
            <PageHeader title="صفحه پیدا نشد" subtitle="آدرس وارد شده وجود ندارد"/>
            <Placeholder>
                <Link to="/">بازگشت به داشبورد</Link>
            </Placeholder>
        </>
    );
}
