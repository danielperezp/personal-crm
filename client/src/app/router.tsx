import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../pages/MainLayout.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';
import { DashboardPage } from '../pages/DashboardPage.tsx';
import { UserManagementPage } from '../features/users/UserManagementPage.tsx';
import { SettingsPage } from '../features/users/SettingsPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/users', element: <UserManagementPage /> },
    ],
  },
]);
