import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav.tsx';
import { useUIStore } from '../stores/uiStore.ts';

export function MainLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <aside className="w-64 flex-shrink-0 bg-gray-900 text-white">
          <div className="p-4">
            <h1 className="text-xl font-bold text-white">NexusCommand</h1>
          </div>
          <SidebarNav />
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-white px-4 shadow-sm">
          <button onClick={toggleSidebar} className="mr-4 rounded p-1 hover:bg-gray-100">
            ☰
          </button>
          <span className="text-sm text-gray-500">NexusCommand Admin</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
