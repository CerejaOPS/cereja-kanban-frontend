import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, ChevronRight, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Checklist {
  id: number;
  title: string;
  description?: string;
  status: string;
  is_completed: boolean | number;
  assignee_name?: string;
  time_spent?: number;
}

interface ChecklistsPanelProps {
  taskId: number;
  checklists: Checklist[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  todo: { label: 'Não iniciado', color: '#64748b' },
  doing: { label: 'Em andamento', color: '#eab308' },
  review: { label: 'Em revisão', color: '#a855f7' },
  done: { label: 'Concluído', color: '#10b981' },
  blocked: { label: 'Bloqueado', color: '#ef4444' },
};

export function ChecklistsPanel({ taskId, checklists }: ChecklistsPanelProps) {
  const [newTitle, setNewTitle] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const createChecklist = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post(`/api/tasks/${taskId}/checklists`, { title });
      return data;
    },
    onSuccess: () => {
      invalidate();
      setNewTitle('');
    },
  });

  const updateChecklist = useMutation({
    mutationFn: async ({
      checklistId,
      updates,
    }: {
      checklistId: number;
      updates: Record<string, any>;
    }) => {
      const { data } = await api.put(`/api/tasks/${taskId}/checklists/${checklistId}`, updates);
      return data;
    },
    onSuccess: invalidate,
  });

  const total = checklists.length;
  const done = checklists.filter((c) => c.status === 'done' || c.is_completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createChecklist.mutate(newTitle.trim());
  };

  const toggleStatus = (chk: Checklist) => {
    const isDone = chk.status === 'done' || chk.is_completed;
    updateChecklist.mutate({
      checklistId: chk.id,
      updates: { status: isDone ? 'todo' : 'done', is_completed: !isDone },
    });
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>
              {done} de {total} etapas concluídas
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#6366f1' }}
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {checklists.map((chk) => {
          const isDone = chk.status === 'done' || chk.is_completed;
          const isExpanded = expandedId === chk.id;
          const st = statusMap[chk.status] || statusMap.todo;

          return (
            <div
              key={chk.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : chk.id)}
              >
                <ChevronRight
                  className={`h-3 w-3 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(chk);
                  }}
                  className="shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-600 hover:text-zinc-400" />
                  )}
                </button>
                <span
                  className={`flex-1 text-xs font-medium ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
                >
                  {chk.title}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: st.color + '22', color: st.color }}
                >
                  {st.label}
                </span>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Status</label>
                      <select
                        value={chk.status}
                        onChange={(e) =>
                          updateChecklist.mutate({
                            checklistId: chk.id,
                            updates: { status: e.target.value },
                          })
                        }
                        className="w-full h-7 rounded border border-zinc-800 bg-zinc-950 px-2 text-[11px] text-zinc-200"
                      >
                        <option value="todo">Não iniciado</option>
                        <option value="doing">Em andamento</option>
                        <option value="review">Em revisão</option>
                        <option value="done">Concluído</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                    </div>
                    {chk.assignee_name && (
                      <div>
                        <label className="text-[10px] text-zinc-500 block mb-0.5">
                          Responsável
                        </label>
                        <span className="text-[11px] text-zinc-300">{chk.assignee_name}</span>
                      </div>
                    )}
                  </div>
                  {chk.description && (
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Descrição</label>
                      <p className="text-[11px] text-zinc-400">{chk.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova etapa..."
          className="text-xs h-8"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newTitle.trim() || createChecklist.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 h-8 px-2 shrink-0"
        >
          {createChecklist.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
