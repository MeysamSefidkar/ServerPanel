/**
 * کاربر فعلی.
 * فعلاً داده نمونه است؛ در مرحله backend از /api/me (Windows Auth) خوانده می‌شود.
 * بقیه برنامه فقط از useCurrentUser استفاده می‌کند، پس آن موقع فقط همین فایل عوض می‌شود.
 */
export type Role = 'Admin' | 'Viewer';

export interface CurrentUser {
    displayName: string;
    userName: string; // DOMAIN\user
    role: Role;
}

const mockUser: CurrentUser = {
    displayName: 'کاربر نمونه',
    userName: 'DOMAIN\\user',
    role: 'Admin',
};

export function useCurrentUser(): CurrentUser {
    return mockUser;
}
