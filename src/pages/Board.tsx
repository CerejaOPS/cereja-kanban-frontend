import { useAuthStore } from '@/shared/lib/store';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { BoardWidget } from '@/features/kanban/BoardWidget';
import { UserMenu } from '@/shared/ui/UserMenu';

export function BoardPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate({ to: '/' });
    }
  }, [token, navigate]);

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6">
        <h1 className="text-lg font-semibold tracking-tight text-white">CherDeal Kanban</h1>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <BoardWidget />
      </main>
    </div>
  );
}
