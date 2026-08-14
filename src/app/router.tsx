import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/Login';
import { BoardPage } from '@/pages/Board';
import { AuthCallback } from '@/pages/AuthCallback';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
});

const boardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/board',
  component: BoardPage,
});

const routeTree = rootRoute.addChildren([indexRoute, authCallbackRoute, boardRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
