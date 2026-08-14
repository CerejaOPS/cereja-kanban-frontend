import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  useTaskDetails,
  useUpdateTask,
  useDeleteTask,
  usePhases,
  useMembers,
  useTaskComments,
  useTaskActivity,
  useAddComment,
  useDeleteComment,
} from '@/entities/task/api';
import {
  Trash2,
  Send,
  MessageSquare,
  ArrowRightLeft,
  Plus,
  UserCheck,
  Loader2,
  ListChecks,
} from 'lucide-react';
import { LabelsPanel } from './LabelsPanel';
import { ChecklistsPanel } from './ChecklistsPanel';
import { TimeTrackingPanel } from './TimeTrackingPanel';

import { useNow } from '@/shared/hooks/useNow';

function phaseColor(id: string) {
  const map: Record<string, string> = {
    backlog: '#64748b',
    todo: '#3b82f6',
    andamento: '#eab308',
    revisao: '#a855f7',
    concluido: '#10b981',
    bloqueado: '#ef4444',
  };
  return map[id] || '#6366f1';
}

function fmtRelativeTime(dt: string, now: Date) {
  if (!dt) return '—';
  const utcDateStr = dt.endsWith('Z') ? dt : dt.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatMinutes(minutes: number) {
  if (!minutes || isNaN(minutes)) return '0m';
  const m = Math.round(minutes);
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

interface TaskDetailsModalProps {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({ taskId, open, onClose }: TaskDetailsModalProps) {
  const now = useNow(60000);
  const { data: task, isLoading } = useTaskDetails(taskId);
  const { data: phases } = usePhases();
  const { data: members } = useMembers();
  const { data: comments } = useTaskComments(taskId);
  const { data: activities } = useTaskActivity(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'checklists' | 'info'>('timeline');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPhase(task.phase || '');
      setAssignee(task.assignee_discord_id || '');
      setDueDate(task.due_date ? String(task.due_date).split('T')[0] : '');
      setConfirmDelete(false);
    }
  }, [task]);

  const handleSave = () => {
    if (!taskId) return;
    updateTask.mutate({
      taskId,
      updates: {
        title,
        description,
        phase,
        assignee_discord_id: assignee || null,
        due_date: dueDate || null,
      },
    });
  };

  const handleClose = () => {
    if (task && taskId) {
      const hasChanges =
        title !== (task.title || '') ||
        description !== (task.description || '') ||
        phase !== (task.phase || '') ||
        assignee !== (task.assignee_discord_id || '') ||
        dueDate !== (task.due_date ? String(task.due_date).split('T')[0] : '');

      if (hasChanges) {
        handleSave();
      }
    }
    onClose();
  };

  const handleDelete = () => {
    if (!taskId) return;
    deleteTask.mutate(taskId, { onSuccess: () => onClose() });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !taskId) return;
    addComment.mutate(
      { taskId, text: commentText },
      {
        onSuccess: () => setCommentText(''),
      }
    );
  };

  // Merge comments + activities into a timeline
  const timeline = [
    ...(comments || []).map((c: any) => ({
      ...c,
      type: 'comment',
      timeMs: new Date(c.created_at).getTime(),
    })),
    ...(activities || []).map((a: any) => ({
      ...a,
      type: 'activity',
      timeMs: new Date(a.created_at).getTime(),
    })),
  ].sort((a, b) => b.timeMs - a.timeMs);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">#{taskId}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: phaseColor(phase) + '22',
                color: phaseColor(phase),
                border: `1px solid ${phaseColor(phase)}44`,
              }}
            >
              {phases?.find((p) => p.id === phase)?.name || phase}
            </span>
          </div>
          <DialogTitle className="sr-only">Detalhes da Tarefa</DialogTitle>
          <DialogDescription className="sr-only">Editar informações da tarefa</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Left Column */}
            <div className="flex-1 space-y-5 overflow-y-auto pr-2">
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold border-none bg-transparent px-0 h-auto focus-visible:ring-0 text-zinc-50"
                  placeholder="Título da tarefa"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Descrição
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sem descrição..."
                  className="min-h-[120px] resize-none"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Fase
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700"
                  >
                    {phases?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Responsável
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700"
                  >
                    <option value="">Sem atribuição</option>
                    {members?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name || m.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Prazo
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-48"
                />
              </div>

              {/* Labels */}
              {taskId && task && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Etiquetas
                  </label>
                  <LabelsPanel taskId={taskId} taskLabels={(task as any).labels || []} />
                </div>
              )}

              {/* Time Tracking */}
              {taskId && task && (
                <div className="pt-2">
                  <TimeTrackingPanel taskId={taskId} task={task} />
                </div>
              )}

              {/* Info row */}
              {task && (
                <div className="flex gap-6 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                  <span>Criado: {fmtRelativeTime(task.created_at, now)}</span>
                  {task.updated_at && (
                    <span>Atualizado: {fmtRelativeTime(task.updated_at, now)}</span>
                  )}
                  {(task as any).timeSpent > 0 && (
                    <span>Tempo: {formatMinutes((task as any).timeSpent)}</span>
                  )}
                </div>
              )}

              {/* Delete Zone */}
              <div className="pt-4 border-t border-zinc-800">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-400">Tem certeza?</span>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirmar Exclusão
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-2"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Excluir Tarefa
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="w-80 shrink-0 flex flex-col border-l border-zinc-800 pl-4 overflow-hidden">
              <div className="flex border-b border-zinc-800 mb-3">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 pb-2 text-xs font-semibold transition-colors ${activeTab === 'timeline' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('checklists')}
                  className={`flex-1 pb-2 text-xs font-semibold transition-colors ${activeTab === 'checklists' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Checklists
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 pb-2 text-xs font-semibold transition-colors ${activeTab === 'info' ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Info
                </button>
              </div>

              {activeTab === 'timeline' && (
                <>
                  {/* Comment input */}
                  <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Adicionar comentário..."
                      className="text-xs h-8"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!commentText.trim() || addComment.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 h-8 px-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>

                  {/* Timeline feed */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {timeline.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-8">
                        Nenhuma atividade registrada.
                      </p>
                    )}
                    {timeline.map((item: any, i: number) => (
                      <div key={`${item.type}-${item.id}-${i}`} className="flex gap-2.5 group">
                        <div
                          className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]"
                          style={{
                            background:
                              item.type === 'comment'
                                ? '#6366f1'
                                : item.action === 'created'
                                  ? '#10b981'
                                  : item.action === 'moved' || item.action === 'phase_changed'
                                    ? '#06b6d4'
                                    : item.action === 'assigned'
                                      ? '#8b5cf6'
                                      : '#64748b',
                            color: '#fff',
                          }}
                        >
                          {item.type === 'comment' ? (
                            <MessageSquare className="h-3 w-3" />
                          ) : item.action === 'created' ? (
                            <Plus className="h-3 w-3" />
                          ) : item.action === 'moved' || item.action === 'phase_changed' ? (
                            <ArrowRightLeft className="h-3 w-3" />
                          ) : (
                            <UserCheck className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {item.type === 'comment' ? (
                            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2.5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-medium text-zinc-300">
                                  {item.author_name || 'Anônimo'}
                                </span>
                                <span className="text-[10px] text-zinc-600">
                                  {fmtRelativeTime(item.created_at, now)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 whitespace-pre-wrap break-words">
                                {item.text}
                              </p>
                            </div>
                          ) : (
                            <div className="py-1">
                              <p className="text-[11px] text-zinc-400">
                                {item.action === 'created' && (
                                  <>
                                    <strong className="text-zinc-300">{item.actor_name}</strong>{' '}
                                    criou a tarefa
                                  </>
                                )}
                                {(item.action === 'moved' || item.action === 'phase_changed') && (
                                  <>
                                    Movida de{' '}
                                    <strong className="text-zinc-300">{item.from_phase}</strong> →{' '}
                                    <strong className="text-zinc-300">{item.to_phase}</strong>
                                  </>
                                )}
                                {item.action === 'assigned' && (
                                  <>
                                    Atribuída para{' '}
                                    <strong className="text-zinc-300">{item.actor_name}</strong>
                                  </>
                                )}
                                {item.action === 'unassigned' && <>Atribuição removida</>}
                                {![
                                  'created',
                                  'moved',
                                  'phase_changed',
                                  'assigned',
                                  'unassigned',
                                ].includes(item.action) && (
                                  <>
                                    <strong className="text-zinc-300">{item.actor_name}</strong>:{' '}
                                    {item.action}
                                  </>
                                )}
                              </p>
                              <span className="text-[10px] text-zinc-600">
                                {fmtRelativeTime(item.created_at, now)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {activeTab === 'checklists' && taskId && task && (
                <div className="flex-1 overflow-y-auto">
                  <ChecklistsPanel taskId={taskId} checklists={(task as any).checklists || []} />
                </div>
              )}

              {activeTab === 'info' && task && (
                <div className="space-y-4 text-xs text-zinc-400 overflow-y-auto">
                  <div>
                    <span className="text-zinc-500">ID:</span>{' '}
                    <span className="text-zinc-200">#{task.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Criado em:</span>{' '}
                    <span className="text-zinc-200">
                      {new Date(task.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {task.updated_at && (
                    <div>
                      <span className="text-zinc-500">Atualizado:</span>{' '}
                      <span className="text-zinc-200">
                        {new Date(task.updated_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {task.assignee_name && (
                    <div>
                      <span className="text-zinc-500">Responsável:</span>{' '}
                      <span className="text-zinc-200">{task.assignee_name}</span>
                    </div>
                  )}
                  {(task as any).timeSpent > 0 && (
                    <div>
                      <span className="text-zinc-500">Tempo gasto:</span>{' '}
                      <span className="text-zinc-200">
                        {formatMinutes((task as any).timeSpent)}
                      </span>
                    </div>
                  )}
                  {(task as any).labels?.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block mb-1">Etiquetas:</span>
                      <div className="flex flex-wrap gap-1">
                        {(task as any).labels.map((l: any) => (
                          <span
                            key={l.id}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: l.color, color: '#fff' }}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(task as any).checklists?.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block mb-1">Checklists:</span>
                      {(task as any).checklists.map((cl: any) => (
                        <div key={cl.id} className="flex items-center gap-2 py-1">
                          <div
                            className={`h-3 w-3 rounded-sm border ${cl.is_completed ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}
                          />
                          <span
                            className={`text-zinc-300 ${cl.is_completed ? 'line-through opacity-50' : ''}`}
                          >
                            {cl.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
