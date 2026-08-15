import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Settings, Bell, MessageSquare, Hash, Wifi, WifiOff, Bot } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'notifications' | 'discord';

const channelLabels: Record<string, { label: string; emoji: string }> = {
  forum: { label: 'Fórum de Tarefas', emoji: '📋' },
  review: { label: 'Canal de Revisão', emoji: '🔍' },
  alerts: { label: 'Canal de Alertas', emoji: '🚨' },
  summary: { label: 'Resumo Kanban', emoji: '📊' },
  log: { label: 'Log de Atividades', emoji: '📝' },
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('discord');
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyPhaseChanges, setNotifyPhaseChanges] = useState(false);

  const { data: discordStatus, isLoading: isLoadingDiscord } = useQuery({
    queryKey: ['discord-status'],
    queryFn: async () => {
      const { data } = await api.get('/api/discord/status');
      return data as {
        botOnline: boolean;
        botUrl: string;
        channels: Record<string, string | null>;
      };
    },
    enabled: open,
    refetchInterval: open ? 30000 : false,
  });

  const { data: heartbeatStatus } = useQuery({
    queryKey: ['bot-heartbeat'],
    queryFn: async () => {
      const { data } = await api.get('/api/bot/status');
      return data as {
        online: boolean;
        lastSeen: string | null;
        secondsAgo: number;
        message?: string;
      };
    },
    enabled: open,
    refetchInterval: open ? 15000 : false,
  });

  const isBotOnline = discordStatus?.botOnline || heartbeatStatus?.online || false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <div className="flex h-[480px]">
          {/* Sidebar */}
          <div className="w-48 bg-zinc-900/50 border-r border-zinc-800 p-4 flex flex-col">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">
              Configurações
            </h2>
            <nav className="space-y-1 flex-1">
              <button
                type="button"
                onClick={() => setTab('discord')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab === 'discord'
                    ? 'bg-zinc-800/80 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                }`}
              >
                <Bot className="h-4 w-4" /> Discord
              </button>
              <button
                type="button"
                onClick={() => setTab('notifications')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab === 'notifications'
                    ? 'bg-zinc-800/80 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                }`}
              >
                <Bell className="h-4 w-4" /> Notificações
              </button>
            </nav>
            <div className="pt-3 border-t border-zinc-800/50">
              <p className="text-[10px] text-zinc-600 px-2">Logado como @{user?.username}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {tab === 'discord' && (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5 text-indigo-400" />
                    Integração Discord
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm">
                    Status do bot e canais configurados no servidor.
                  </DialogDescription>
                </DialogHeader>

                {/* Bot Status */}
                <div className="mb-6">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      isBotOnline
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        isBotOnline ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}
                    >
                      {isLoadingDiscord ? (
                        <div className="h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                      ) : isBotOnline ? (
                        <Wifi className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-200">CherDeal Bot</h4>
                      <p
                        className={`text-xs ${isBotOnline ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {isLoadingDiscord
                          ? 'Verificando...'
                          : isBotOnline
                            ? '● Online'
                            : '● Offline'}
                      </p>
                      {heartbeatStatus?.lastSeen && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                          Último sinal: {heartbeatStatus.secondsAgo < 60
                            ? `há ${heartbeatStatus.secondsAgo}s`
                            : `há ${Math.floor(heartbeatStatus.secondsAgo / 60)}min`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Canais Configurados
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(channelLabels).map(([key, meta]) => {
                      const channelId = discordStatus?.channels?.[key];
                      const isConfigured = !!channelId;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/20"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{meta.emoji}</span>
                            <div>
                              <p className="text-sm font-medium text-zinc-300">{meta.label}</p>
                              {isConfigured && (
                                <p className="text-[10px] text-zinc-600 font-mono">
                                  ID: {channelId}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                              isConfigured
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {isLoadingDiscord ? '...' : isConfigured ? 'Ativo' : 'Não configurado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-600 mt-4 text-center">
                  Os canais são configurados nas variáveis de ambiente do servidor.
                </p>
              </>
            )}

            {tab === 'notifications' && (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-400" />
                    Preferências de Notificação
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm">
                    Escolha como você quer ser avisado pelo bot no Discord.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-200">Menções em Tarefas</h4>
                        <p className="text-xs text-zinc-500">
                          Receber DM quando for marcado ou atribuído
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifyMentions}
                        onChange={(e) => setNotifyMentions(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-200">Mudança de Fase</h4>
                        <p className="text-xs text-zinc-500">
                          Aviso quando sua tarefa mudar de fase
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifyPhaseChanges}
                        onChange={(e) => setNotifyPhaseChanges(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>

                  <p className="text-xs text-zinc-500 text-center mt-4">
                    As notificações são enviadas diretamente pelo <strong>CherDeal Bot</strong> no
                    seu Discord pessoal (@{user?.username}).
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
