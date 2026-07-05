import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-glass-scene">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto bg-glass-scene">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
