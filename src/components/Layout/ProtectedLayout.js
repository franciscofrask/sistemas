// src/components/Layout/ProtectedLayout.js
import RouteGuard from '@/components/Auth/RouteGuard';
import { LayoutBase } from '@/layouts/index';

export default function ProtectedLayout({ children }) {
    return (
        <RouteGuard>
            <LayoutBase>
                {children}
            </LayoutBase>
        </RouteGuard>
    );
}