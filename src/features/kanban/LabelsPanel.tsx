import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useLabels } from '@/entities/task/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, X, Tag, Search, Palette, Check } from 'lucide-react';

const presetColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
  '#14b8a6',
  '#f43f5e',
  '#8b5cf6',
];

function colorText(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000' : '#fff';
}

interface Label {
  id: number;
  name: string;
  color: string;
}

interface LabelsPanelProps {
  taskId: number;
  taskLabels: Label[];
}

export function LabelsPanel({ taskId, taskLabels }: LabelsPanelProps) {
  const { data: allLabels } = useLabels();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(presetColors[4]);
  const [filter, setFilter] = useState('');
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['labels'] });
  };

  const setLabels = useMutation({
    mutationFn: async (labelIds: number[]) => {
      const { data } = await api.put(`/api/tasks/${taskId}/labels`, { labels: labelIds });
      return data;
    },
    onSuccess: invalidate,
  });

  const createLabel = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data } = await api.post('/api/labels', { name, color });
      return data;
    },
    onSuccess: (newLabel: any) => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      const currentIds = taskLabels.map((l) => l.id);
      setLabels.mutate([...currentIds, newLabel.id]);
      setNewName('');
      setShowCreate(false);
    },
  });

  const toggleLabel = (label: Label) => {
    const currentIds = taskLabels.map((l) => l.id);
    const hasLabel = currentIds.includes(label.id);
    const newIds = hasLabel
      ? currentIds.filter((id) => id !== label.id)
      : [...currentIds, label.id];
    setLabels.mutate(newIds);
  };

  const removeLabel = (labelId: number) => {
    const newIds = taskLabels.map((l) => l.id).filter((id) => id !== labelId);
    setLabels.mutate(newIds);
  };

  const filteredLabels = (allLabels || []).filter((l: Label) =>
    l.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-2.5">
      {/* Applied labels - premium chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {taskLabels.map((l) => (
          <span
            key={l.id}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-semibold tracking-wide group cursor-default transition-all duration-200 hover:shadow-lg hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, ${l.color}, ${l.color}dd)`,
              color: colorText(l.color),
              boxShadow: `0 2px 8px ${l.color}33`,
            }}
          >
            {l.name}
            <button
              onClick={() => removeLabel(l.id)}
              className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/20"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {/* Add label trigger */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200
            ${
              showDropdown
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'text-zinc-500 border border-dashed border-zinc-700 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5'
            }`}
        >
          <Tag className="h-3 w-3" />
          {taskLabels.length === 0 ? 'Adicionar etiqueta' : '+'}
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="border border-zinc-700/50 rounded-xl bg-zinc-950/95 backdrop-blur-xl p-3 space-y-3 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar etiqueta..."
              className="text-[11px] h-8 pl-8 bg-zinc-900/50 border-zinc-800 focus-visible:ring-indigo-500/30"
              autoFocus
            />
          </div>

          {/* Label list */}
          <div className="max-h-40 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredLabels.map((l: Label) => {
              const isSelected = taskLabels.some((tl) => tl.id === l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLabel(l)}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-left text-[12px] transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-indigo-500/10 border border-indigo-500/20'
                        : 'hover:bg-zinc-800/50 border border-transparent'
                    }`}
                >
                  <div
                    className="h-4 w-4 rounded-md shrink-0 shadow-sm transition-transform duration-200 hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${l.color}, ${l.color}cc)`,
                      boxShadow: `0 1px 4px ${l.color}44`,
                    }}
                  />
                  <span
                    className={`flex-1 ${isSelected ? 'text-zinc-100 font-medium' : 'text-zinc-300'}`}
                  >
                    {l.name}
                  </span>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
            {filteredLabels.length === 0 && (
              <div className="flex flex-col items-center py-4 text-zinc-600">
                <Tag className="h-5 w-5 mb-1.5 opacity-50" />
                <p className="text-[11px]">Nenhuma etiqueta encontrada</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Create new label */}
          {showCreate ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome da nova etiqueta"
                  className="text-[12px] h-8 bg-zinc-900/50 border-zinc-800 pr-16"
                  autoFocus
                />
                {/* Live preview */}
                {newName && (
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${newColor}, ${newColor}dd)`,
                      color: colorText(newColor),
                      boxShadow: `0 1px 4px ${newColor}33`,
                    }}
                  >
                    {newName}
                  </span>
                )}
              </div>

              {/* Color palette */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Palette className="h-3 w-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    Cor
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className="relative h-6 w-6 rounded-lg transition-all duration-200 hover:scale-125"
                      style={{
                        background: `linear-gradient(135deg, ${c}, ${c}cc)`,
                        boxShadow:
                          newColor === c
                            ? `0 0 0 2px #18181b, 0 0 0 4px ${c}, 0 2px 12px ${c}66`
                            : `0 1px 3px ${c}33`,
                        transform: newColor === c ? 'scale(1.15)' : undefined,
                      }}
                    >
                      {newColor === c && (
                        <Check
                          className="absolute inset-0 m-auto h-3 w-3"
                          style={{ color: colorText(c) }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName('');
                  }}
                  className="h-7 text-[11px] text-zinc-400 hover:text-zinc-200 flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    newName.trim() && createLabel.mutate({ name: newName.trim(), color: newColor })
                  }
                  disabled={!newName.trim() || createLabel.isPending}
                  className="h-7 text-[11px] flex-1 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${newColor}, ${newColor}cc)`,
                    boxShadow: `0 2px 8px ${newColor}44`,
                  }}
                >
                  {createLabel.isPending ? 'Criando...' : 'Criar Etiqueta'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 border border-dashed border-zinc-800 hover:border-indigo-500/30 transition-all duration-200"
            >
              <Plus className="h-3.5 w-3.5" /> Criar nova etiqueta
            </button>
          )}
        </div>
      )}
    </div>
  );
}
