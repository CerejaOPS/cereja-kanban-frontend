import { useState } from 'react';
import { useMembers, useLabels } from '@/entities/task/api';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Search, Users, Tag, X, BarChart3, Plus } from 'lucide-react';
import { MembersModal } from './MembersModal';
import { MetricsModal } from './MetricsModal';
import { CreateTaskModal } from './CreateTaskModal';

export interface FilterState {
  text: string;
  assignee: string;
  label: string;
}

interface BoardHeaderProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export function BoardHeader({ filters, setFilters }: BoardHeaderProps) {
  const { data: members } = useMembers();
  const { data: labels } = useLabels();
  const [showFilters, setShowFilters] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const handleClear = () => setFilters({ text: '', assignee: '', label: '' });

  const activeCount = [filters.text, filters.assignee, filters.label].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 mb-4 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Meu Quadro</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-200 transition-colors ${showFilters || activeCount > 0 ? 'border-indigo-500/50 text-indigo-400' : 'text-zinc-400'}`}
          >
            <Search className="h-4 w-4 mr-2" />
            Filtros
            {activeCount > 0 && (
              <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMembers(true)}
            className="h-8 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Membros
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(true)}
            className="h-8 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </Button>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          <CreateTaskModal />
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={filters.text}
              onChange={(e) => setFilters({ ...filters, text: e.target.value })}
              placeholder="Buscar por título ou ID..."
              className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-sm"
            />
          </div>

          <div className="relative min-w-[160px]">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 appearance-none"
            >
              <option value="">Qualquer responsável</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.display_name || m.username}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <select
              value={filters.label}
              onChange={(e) => setFilters({ ...filters, label: e.target.value })}
              className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 appearance-none"
            >
              <option value="">Qualquer etiqueta</option>
              {labels?.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-1.5" /> Limpar
            </Button>
          )}
        </div>
      )}

      <MembersModal open={showMembers} onClose={() => setShowMembers(false)} />
      <MetricsModal open={showMetrics} onClose={() => setShowMetrics(false)} />
    </div>
  );
}
