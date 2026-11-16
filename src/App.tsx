import { useState } from 'react';
import { useTasks } from './hooks/useTask'
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { TaskDetailsModal } from './components/Task/TaskDetailsModal';
import { Task } from './types/Task';
import styles from './App.module.css';

function App() {
  const { tasks, members, handleMove, handleUpdateTask, handleDeleteTask, handleAssignTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Mantém a task aberta sincronizada com o estado global do quadro
  const activeTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cereja Kanban</h1>
      
      <KanbanBoard tasks={tasks} onMove={handleMove} 
        onCardClick={(task) => setSelectedTask(task)}
      />

      <TaskDetailsModal task={activeTask} members={members} isOpen={selectedTask !== null} 
        onClose={() => setSelectedTask(null)} 
        onSave={(updatedTask) => { handleUpdateTask(updatedTask); setSelectedTask(null); 
        }}
        onAssign={(taskId, member) => handleAssignTask(taskId, member)}
        onDelete={(taskId) => { handleDeleteTask(taskId); setSelectedTask(null); }}
      />
    </div>
  );
}

export default App;
