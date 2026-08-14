import { usePhases, useTasks } from '@/entities/task/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { BarChart3, Loader2, Target, CheckCircle2, Clock } from 'lucide-react';

interface MetricsModalProps {
  open: boolean;
  onClose: () => void;
}

export function MetricsModal({ open, onClose }: MetricsModalProps) {
  const { data: phases, isLoading: loadingPhases } = usePhases();
  const { data: tasks, isLoading: loadingTasks } = useTasks();

  const loading = loadingPhases || loadingTasks;

  const totalTasks = tasks?.length || 0;
  const doneTasks = tasks?.filter((t) => t.phase === 'concluido').length || 0;
  const totalTime = tasks?.reduce((acc, t) => acc + ((t as any).timeSpent || 0), 0) || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            Dashboard de Métricas
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Acompanhamento de produtividade e distribuição de tarefas do projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">{totalTasks}</div>
                    <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      Total de Tarefas
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">{doneTasks}</div>
                    <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      Concluídas
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-zinc-100">
                      {Math.round(totalTime / 60)}h
                    </div>
                    <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      Tempo Investido
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Progresso Geral</h3>
                    <p className="text-xs text-zinc-500">
                      Completude baseada em tarefas concluídas
                    </p>
                  </div>
                  <div className="text-3xl font-black text-indigo-400">{progress}%</div>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks by Phase */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Distribuição por Fase</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {phases
                    ?.sort((a, b) => a.position - b.position)
                    .map((phase) => {
                      const count = tasks?.filter((t) => t.phase === phase.id).length || 0;
                      const pct = totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);
                      return (
                        <div
                          key={phase.id}
                          className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3 flex flex-col items-center justify-center text-center"
                        >
                          <div className="text-xl font-bold text-zinc-100 mb-1">{count}</div>
                          <div
                            className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2 line-clamp-1 w-full"
                            title={phase.name}
                          >
                            {phase.name}
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
