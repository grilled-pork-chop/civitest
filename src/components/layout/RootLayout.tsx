import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';

export function RootLayout() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white flex flex-col overflow-hidden ">
      <Header />
      <main className="flex-1 bg-slate-50 min-h-[calc(100dvh-65px)]">
        <Outlet />
      </main>
    </div>
  );
}
