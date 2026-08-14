import { useState } from 'react';
import { useTakeTask, useReleaseTask, useLogTime } from '@/entities/task/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Play, Square, Clock, Plus } from 'lucide-react';
import { Task } from '@/entities/task/types';

interface TimeTrackingPanelProps {
  taskId: number;
  task: Task;
}

function formatMinutes(mins: number) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TimeTrackingPanel({ taskId, task }: TimeTrackingPanelProps) {
  const [showLogTime, setShowLogTime] = useState(false);
  const [minutesStr, setMinutesStr] = useState('');
  const [note, setNote] = useState('');

  const takeTask = useTakeTask();
  const releaseTask = useReleaseTask();
  const logTime = useLogTime();

  const handleTake = () => takeTask.mutate(taskId);
  const handleRelease = () =>
    releaseTask.mutate({ taskId, minutes: 0, note: '', phase: task.phase });

  const parseMinutes = (str: string) => {
    let m = 0;
    const hrMatch = str.match(/(\d+)\s*h/);
    const minMatch = str.match(/(\d+)\s*m/);
    if (hrMatch) m += parseInt(hrMatch[1]) * 60;
    if (minMatch) m += parseInt(minMatch[1]);
    if (!hrMatch && !minMatch && !isNaN(Number(str))) m += Number(str);
    return m;
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseMinutes(minutesStr);
    if (mins > 0) {
      logTime.mutate(
        { taskId, minutes: mins, note, phase: task.phase, source: 'manual' },
        {
          onSuccess: () => {
            setShowLogTime(false);
            setMinutesStr('');
            setNote('');
          },
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Controle de Tempo
        </label>
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          Total: {formatMinutes((task as any).timeSpent || 0)}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleTake}
          disabled={takeTask.isPending}
          className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30 h-8 text-[11px]"
        >
          <Play className="h-3.5 w-3.5 mr-1.5" /> Iniciar
        </Button>
        <Button
          size="sm"
          onClick={handleRelease}
          disabled={releaseTask.isPending}
          className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 h-8 text-[11px]"
        >
          <Square className="h-3.5 w-3.5 mr-1.5" /> Parar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLogTime(!showLogTime)}
          className={`px-3 h-8 border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors ${showLogTime ? 'bg-zinc-800' : ''}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showLogTime && (
        <form
          onSubmit={handleLogSubmit}
          className="space-y-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-top-2"
        >
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Tempo (ex: 1h 30m ou 45)</label>
            <Input
              value={minutesStr}
              onChange={(e) => setMinutesStr(e.target.value)}
              placeholder="ex: 1h 30m"
              className="h-8 text-xs bg-zinc-950 border-zinc-800"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Nota (opcional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="O que foi feito?"
              className="min-h-[60px] text-xs bg-zinc-950 border-zinc-800 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLogTime(false)}
              className="h-7 text-[11px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!minutesStr || logTime.isPending}
              className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-700"
            >
              Registrar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
