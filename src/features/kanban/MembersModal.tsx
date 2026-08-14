import { useMembers, useTasks } from '@/entities/task/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Users, Loader2 } from 'lucide-react';

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
}

export function MembersModal({ open, onClose }: MembersModalProps) {
  const { data: members, isLoading: loadingMembers } = useMembers();
  const { data: tasks, isLoading: loadingTasks } = useTasks();

  const loading = loadingMembers || loadingTasks;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-indigo-400" />
            Equipe do Projeto
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Visão geral dos membros e suas cargas de trabalho atuais.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="grid gap-4">
              {members?.map((member: any) => {
                const memberTasks = tasks?.filter((t) => t.assignee_discord_id === member.id) || [];
                const doingTasks = memberTasks.filter((t) => t.phase === 'andamento');
                const doneTasks = memberTasks.filter((t) => t.phase === 'concluido');
                const totalTime = memberTasks.reduce(
                  (acc, t) => acc + ((t as any).timeSpent || 0),
                  0
                );

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-800/30 transition-colors"
                  >
                    {member.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${member.discord_id}/${member.avatar}.png`}
                        alt={member.username}
                        className="h-12 w-12 rounded-full border-2 border-zinc-800"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-lg">
                        {(member.display_name || member.username || 'A')[0].toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-200 truncate">
                        {member.display_name || member.username}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate">@{member.username}</p>
                    </div>

                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-lg font-bold text-zinc-300">{doingTasks.length}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-medium">
                          Em Andamento
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-400">{doneTasks.length}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-medium">
                          Concluídas
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-indigo-400">
                          {Math.round(totalTime / 60)}h
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-medium">
                          Tempo Gasto
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!members || members.length === 0) && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhum membro encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
