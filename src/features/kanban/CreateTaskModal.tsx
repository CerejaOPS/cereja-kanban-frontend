import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useCreateTask, usePhases, useLabels } from '@/entities/task/api';
import { Plus, Tag, X, ListChecks } from 'lucide-react';

export function CreateTaskModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');

  const { data: phases } = usePhases();
  const { data: labels } = useLabels();
  const createTask = useCreateTask();

  const toggleLabel = (id: number) => {
    setSelectedLabels((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  };

  const addCheckItem = () => {
    const text = newCheckItem.trim();
    if (!text) return;
    setChecklistItems((prev) => [...prev, text]);
    setNewCheckItem('');
  };

  const removeCheckItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const selectedPhase = phase || phases?.[0]?.id || 'backlog';
    createTask.mutate(
      {
        title,
        description: description || undefined,
        phase: selectedPhase,
        board_id: 1,
        labels: selectedLabels.length > 0 ? selectedLabels : undefined,
        checklists: checklistItems.length > 0 ? checklistItems : undefined,
      } as any,
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setPhase('');
          setSelectedLabels([]);
          setChecklistItems([]);
          setNewCheckItem('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar uma tarefa ao quadro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa (opcional)"
              rows={3}
            />
          </div>

          {/* Fase */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Coluna (Fase)</label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
            >
              {phases?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Etiquetas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {labels?.map((label) => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                      ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-offset-zinc-950 scale-105'
                          : 'opacity-60 hover:opacity-100'
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? label.color + '30' : label.color + '15',
                      borderColor: isSelected ? label.color : label.color + '40',
                      color: label.color,
                    }}
                  >
                    {isSelected && <X className="inline h-3 w-3 mr-1 -ml-0.5" />}
                    {label.name}
                  </button>
                );
              })}
              {(!labels || labels.length === 0) && (
                <span className="text-xs text-zinc-600">Nenhuma etiqueta criada.</span>
              )}
            </div>
          </div>

          {/* Etapas (Checklist) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> Etapas
            </label>

            {checklistItems.length > 0 && (
              <div className="space-y-1.5">
                {checklistItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 group"
                  >
                    <div className="h-4 w-4 rounded border-2 border-zinc-600 flex-shrink-0" />
                    <span className="text-sm text-zinc-300 flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeCheckItem(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                placeholder="Adicionar etapa..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCheckItem();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCheckItem}
                disabled={!newCheckItem.trim()}
                className="h-9 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {checklistItems.length > 0 && (
              <p className="text-[10px] text-zinc-600">
                {checklistItems.length} etapa{checklistItems.length > 1 ? 's' : ''} adicionada
                {checklistItems.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title || createTask.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
