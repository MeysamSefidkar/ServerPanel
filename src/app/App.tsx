import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {AppLayout} from './layout/AppLayout';
import {modules} from "./module.ts";
import {NotFoundPage} from './NotFoundPage';
import {useCurrentUser} from "../shared/auth/useCurrentUser.ts";

/**
 * مسیرها خودکار از روی فهرست ماژول‌ها ساخته می‌شوند.
 * ماژول‌های adminOnly برای Viewer اصلاً route ندارند (نه فقط مخفی از منو).
 */
export function App() {
    const user = useCurrentUser();
    const allowed = modules.filter((m) => !m.adminOnly || user.role === 'Admin');

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout/>}>
                    {allowed.map(({id, path, page: Page}) =>
                        path === '/' ? (
                            <Route key={id} index element={<Page/>}/>
                        ) : (
                            <Route key={id} path={`${path}/*`} element={<Page/>}/>
                        ),
                    )}
                    <Route path="*" element={<NotFoundPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
