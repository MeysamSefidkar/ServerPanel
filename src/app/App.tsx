import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';
import {AppLayout} from './layout/AppLayout';
import {modules} from "./modules";
import {NotFoundPage} from './NotFoundPage';
import {useCurrentUser} from "../shared/auth/useCurrentUser";
import {ServerFormPage} from "../features/servers/ServerFormPage";

/**
 * مسیرها خودکار از روی فهرست ماژول‌ها ساخته می‌شوند.
 * ماژول‌های adminOnly برای Viewer اصلاً route ندارند (نه فقط مخفی از منو).
 */
export function App() {
    const user = useCurrentUser();
    const allowed = modules.filter((m) => !m.adminOnly || user.role === 'Admin');
    const isAdmin = user.role === 'Admin';

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

                    {isAdmin && <Route path="servers/new" element={<ServerFormPage/>}/>}
                    {isAdmin && <Route path="servers/:id/edit" element={<ServerFormPage/>}/>}
                    {!isAdmin && <Route path="servers/new" element={<Navigate to="/servers" replace/>}/>}
                    {!isAdmin && <Route path="servers/:id/edit" element={<Navigate to="/servers" replace/>}/>}

                    <Route path="*" element={<NotFoundPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
