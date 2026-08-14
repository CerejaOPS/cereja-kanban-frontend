import { Task } from '@/entities/task/types';
import { Card, CardContent } from '@/shared/ui/card';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, User } from 'lucide-react';
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
  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatMinutes(minutes: number) {
  if (!minutes || isNaN(minutes)) return '0m';
  const m = Math.round(minutes);
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const now = useNow(60000);
  const color = phaseColor(task.phase);
  const assigneeName = (task as any).assignee_name || 'Livre';
  const labels = (task as any).labels || [];
  const checklists = (task as any).checklists || [];
  const timeSpent = (task as any).timeSpent || 0;

  const checkDone = checklists.filter((c: any) => c.status === 'done' || c.is_completed).length;
  const checkTotal = checklists.length;
  const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 transition-all duration-200 ${snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''}`}
          onClick={onClick}
        >
          <Card className="border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 transition-all cursor-pointer backdrop-blur-sm group">
            <CardContent className="p-3.5">
              {/* Header: ID */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-zinc-600">#{task.id}</span>
                <span className="text-[10px] text-zinc-600">
                  {fmtRelativeTime(task.updated_at || task.created_at, now)}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-medium text-zinc-100 leading-snug mb-2">{task.title}</h4>

              {/* Labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {labels.map((l: any) => (
                    <span
                      key={l.id}
                      className="px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: `linear-gradient(135deg, ${l.color}, ${l.color}cc)`,
                        color: '#fff',
                        boxShadow: `0 1px 4px ${l.color}44`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Due Date */}
              {(task as any).due_date && (
                <div className="mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    📅{' '}
                    {new Date((task as any).due_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              )}

              {/* Checklist progress */}
              {checkTotal > 0 && (
                <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500">
                  <span>
                    ✓ {checkDone}/{checkTotal}
                  </span>
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${checkPct}%`,
                        background: checkPct === 100 ? '#10b981' : '#6366f1',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Footer: Assignee + Time */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <User className="h-3 w-3" style={{ color }} />
                  <span className="truncate max-w-[80px]">{assigneeName}</span>
                </div>
                {timeSpent > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatMinutes(timeSpent)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
