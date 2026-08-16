import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Settings} from 'lucide-react';
import { SettingsModal } from '@/features/kanban/SettingsModal';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const initial = (user?.name || user?.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-full p-1 pr-3 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={initial}
            className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=6366f1&color=fff`;
            }}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm font-bold text-indigo-300">
            {initial}
          </div>
        )}
        <div className="hidden flex-col items-start gap-1 sm:flex text-left">
          <span className="text-sm font-semibold text-zinc-200 leading-none truncate max-w-[120px]">
            {user?.name || user?.username || 'Usuário'}
          </span>
          <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
            @{user?.username || 'user'}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 z-50">
          <div className="px-3 py-2 border-b border-zinc-800/50 mb-1">
            <p className="text-sm font-medium text-zinc-200">{user?.name || user?.username}</p>
            <p className="text-xs text-zinc-500">Logado via Discord</p>
          </div>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowSettings(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
            >
              <Settings className="h-4 w-4" /> Configurações
            </button>
            <div className="h-px bg-zinc-800/50 my-1" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      )}

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
